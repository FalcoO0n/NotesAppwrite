import { databases, ID } from "@/lib/appwrite";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

function ChatRoom() {
  const [messages, setMessages] = useState<any>([]);
  const [message, setMessage] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["messages"],
    queryFn: () => {
      databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID!
      );
    },
  });
  console.log(data, "daaaaaa");
  let getMessages = async () => {
    let promise = databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID!
    );
    promise.then(
      (response) => {
        console.log(response, "response");
        setMessages(response.documents);
      },
      (error) => {
        console.log(error, "error");
      }
    );
  };

  useEffect(() => {
    getMessages();
    console.log(messages, "messagesEffect");
  }, []);

  const handleSendMessage = (message: string) => {
    const promise = databases.createDocument(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
      process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID!,
      ID.unique(),
      {
        body: message,
      }
    );
    promise.then(
      (response) => {
        console.log(response, "response");
        setMessages([...messages, response]);
      },
      (error) => {
        console.log(error, "error");
      }
    );

    setMessage("");
  };

  const submitMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSendMessage(message);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col items-end max-h-[500px] overflow-y-auto  p-2">
        {messages?.map((message: any) => (
          <div key={message.$id} className="flex flex-col max-w-[70%] mb-2 ">
            <div className="bg-blue-500 text-white rounded-tl-xl rounded-tr-xl rounded-bl-xl py-2 px-4 inline-block">
              <p className="break-words">{message.body}</p>
            </div>
            <span className="text-xs text-gray-500 mt-1 text-right">
              {new Date(message.$createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={submitMessage}>
        <div className="flex flex-row gap-2">
          <input
            type="text"
            value={message}
            placeholder="Enter your message"
            maxLength={1000}
            onChange={(e) => setMessage(e.target.value)}
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

export default ChatRoom;
