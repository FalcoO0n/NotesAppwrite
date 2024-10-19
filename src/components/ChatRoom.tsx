import { databases, ID } from "@/lib/appwrite";
import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Query } from "appwrite";

interface Message {
  $id: string;
  body: string;
  $createdAt: string;
  $updatedAt: string;
}

const MessageComponent = memo<{
  message: Message;
  onDelete: (messageId: string) => void;
}>(({ message, onDelete }) => {
  return (
    <div
      key={message.$id}
      className="flex flex-col max-w-[70%] mb-2 cursor-pointer select-none"
      onDoubleClick={() => onDelete(message.$id)}
    >
      <div className="bg-blue-500 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl py-2 px-4 inline-block">
        <p className="break-words">{message.body}</p>
      </div>
      <span className="text-xs text-gray-500 mt-1 text-right">
        {new Date(message.$createdAt).toLocaleTimeString()}
      </span>
      {/* <button onClick={() => onDelete(message.$id)}>Delete</button> */}
    </div>
  );
});

function ChatRoom() {
  const [message, setMessage] = useState<string>("");
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: getAllMessages,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["messages"],
    queryFn: () =>
      databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID!,
        [Query.orderDesc("$createdAt"), Query.limit(15)]
      ),
  });

  const { mutate: createMessage } = useMutation({
    mutationFn: (message: string) =>
      databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID!,
        ID.unique(),
        { body: message }
      ),
    onMutate: async (newMessage) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["messages"] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData<
        Models.DocumentList<Message>
      >(["messages"]);

      // Optimistically update to the new value
      const optimisticMessage: Message = {
        $id: "temp-id-" + Date.now(),
        body: newMessage,
        $createdAt: new Date().toISOString(),
        $updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData<Models.DocumentList<Message>>(
        ["messages"],
        (old) => ({
          ...old!,
          documents: [optimisticMessage, ...(old?.documents || [])],
        })
      );

      // Return a context object with the snapshotted value
      setMessage("");
      return { previousMessages };
    },
    onError: (err, newMessage, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(["messages"], context?.previousMessages);
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the correct data
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  const { mutate: deleteMessage } = useMutation({
    mutationFn: (messageId: string) =>
      databases.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID!,
        messageId
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });

  // console.log(getAllMessages, "messages");

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom, getAllMessages]);

  const submitMessage = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      createMessage(message);
    },
    [createMessage, message]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
    },
    []
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      deleteMessage(messageId);
    },
    [deleteMessage]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-end max-h-[500px] overflow-y-auto p-2">
        {isLoading && <p>Loading messages...</p>}
        {isError && <p>Error loading messages.</p>}

        {getAllMessages?.documents
          ?.slice()
          .reverse()
          .map((msg) => (
            <MessageComponent
              key={msg.$id}
              message={msg as unknown as Message}
              onDelete={handleDeleteMessage}
            />
          ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={submitMessage}>
        <div className="flex flex-row gap-2">
          <input
            type="text"
            value={message}
            placeholder="Enter your message"
            maxLength={1000}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-md p-2 w-24"
            disabled={!message}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default memo(ChatRoom);
