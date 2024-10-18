"use client";

import { useState, useEffect } from "react";
import { databases, account, ID } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import GroupList from "@/components/GroupList";
import CreateGroupForm from "@/components/CreateGroupForm";
import { Query } from "appwrite";

export default function Groups() {
  const [user, setUser] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [inviteeEmail, setInviteeEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get();
        setUser(session);
        fetchGroups(session.$id);
      } catch (error) {
        router.push("/login");
      }
    };
    checkSession();
  }, [router]);

  const fetchGroups = async (userId: string) => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
        [Query.contains("members", [userId])]
      );
      setGroups(response.documents);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleCreateGroup = async (name: string) => {
    try {
      const newGroup = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
        ID.unique(),
        {
          name,
          members: [user.$id],
          createdBy: user.$id,
        }
      );
      setGroups([...groups, newGroup]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const checkExistingInvitation = async (groupId: string, inviteeEmail: string) => {
    try {
      // Check if invitation exists
      const invitationResponse = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUP_INVITATIONS_COLLECTION_ID!,
        [
          Query.equal("groupId", groupId),
          Query.equal("inviteeEmail", inviteeEmail),
          Query.equal("status", "pending")
        ]
      );

      if (invitationResponse.documents.length > 0) {
        return { exists: true, reason: 'invitation' };
      }

      // Check if user is already a member of the group
      const groupResponse = await databases.getDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
        groupId
      );

      const inviteeUser = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID!,
        [Query.equal("email", inviteeEmail)]
      );

      if (inviteeUser.documents.length > 0 && groupResponse.members.includes(inviteeUser.documents[0].$id)) {
        return { exists: true, reason: 'member' };
      }

      return { exists: false };
    } catch (error) {
      console.error('Error checking existing invitation or membership:', error);
      return { exists: false };
    }
  };

  const sendGroupInvitation = async (groupId: string, inviteeEmail: string) => {
    try {
      const checkResult = await checkExistingInvitation(groupId, inviteeEmail);
      if (checkResult.exists) {
        if (checkResult.reason === 'invitation') {
          setErrorMessage('An invitation for this group and email already exists.');
        } else if (checkResult.reason === 'member') {
          setErrorMessage('This user is already a member of the group.');
        }
        return false;
      }

      await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUP_INVITATIONS_COLLECTION_ID!,
        ID.unique(),
        {
          groupId,
          inviteeEmail,
          status: 'pending',
          createdBy: user.$id,
        }
      );
      setErrorMessage('');
      return true;
      // Optionally, send an email notification here
    } catch (error) {
      console.error('Error sending group invitation:', error);
      setErrorMessage('An error occurred while sending the invitation.');
      return false;
    }
  };

  const fetchInvitations = async (userEmail: string) => {
    try {
      const response = await databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUP_INVITATIONS_COLLECTION_ID!,
        [
          Query.equal("inviteeEmail", userEmail),
          Query.equal("status", "pending"),
        ]
      );
      setInvitations(response.documents);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvitations(user.email);
    }
  }, [user]);

  const handleInvitation = async (invitationId: string, accept: boolean) => {
    try {
      if (accept) {
        // Fetch the invitation to get the groupId
        const invitation = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_GROUP_INVITATIONS_COLLECTION_ID!,
          invitationId
        );

        // Add the user to the group
        const group = await databases.getDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
          invitation.groupId
        );

        await databases.updateDocument(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
          process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
          invitation.groupId,
          {
            members: [...group.members, user.$id],
          }
        );
      }

      // Update the invitation status
      await databases.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUP_INVITATIONS_COLLECTION_ID!,
        invitationId,
        {
          status: accept ? "accepted" : "rejected",
        }
      );

      // Refresh the invitations list
      console.log(user.email, "user.email");
      fetchInvitations(user.email);
      // If accepted, also refresh the groups list
      if (accept) fetchGroups(user.$id);
    } catch (error) {
      console.error("Error handling invitation:", error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedGroup && inviteeEmail) {
      const success = await sendGroupInvitation(selectedGroup, inviteeEmail)
      if (success) {
        setInviteeEmail('')
        // Optionally, show a success message
      }
    }
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Manage Groups</h1>
      <CreateGroupForm onCreateGroup={handleCreateGroup} />
      <GroupList groups={groups} />

      <h2 className="text-2xl font-bold mt-8 mb-4">Pending Invitations</h2>
      {invitations.map((invitation) => (
        <div key={invitation.$id} className="mb-4 p-4 border rounded">
          <p>Invitation to join group: {invitation.groupId}</p>
          <button
            onClick={() => handleInvitation(invitation.$id, true)}
            className="mr-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            Accept
          </button>
          <button
            onClick={() => handleInvitation(invitation.$id, false)}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Reject
          </button>
        </div>
      ))}

      <h2 className="text-2xl font-bold mt-8 mb-4">Invite to Group</h2>
      {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}

      <form onSubmit={handleInvite} className="mb-8">
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="">Select a group</option>
          {groups.map((group) => (
            <option key={group.$id} value={group.$id}>
              {group.name}
            </option>
          ))}
        </select>
        <input
          type="email"
          value={inviteeEmail}
          onChange={(e) => setInviteeEmail(e.target.value)}
          placeholder="Enter email to invite"
          className="mr-2 p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Invitation
        </button>
      </form>
    </div>
  );
}
