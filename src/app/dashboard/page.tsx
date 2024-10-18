"use client";

import { useEffect, useState } from "react";
import { account, databases } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import { Query } from "appwrite";
import ChatRoom from "@/components/ChatRoom";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const searchGroup = databases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
        [Query.equal("name", "HomeMates")]
      );

      searchGroup.then((response) => {
        console.log(response);
      });
    }
  }, [user]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await account.get();
        setUser(session);
      } catch (error) {
        router.push("/login");
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        <h1 className="text-3xl font-bold mb-8">Welcome, {user.name}!</h1>
        <p className="mb-4">
          This is your dashboard. Here you can manage your groups and expenses.
        </p>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>
      <div className="border-2 border-slate-500 rounded-lg p-4 mt-5 mx-6 ">
        <ChatRoom />
      </div>
    </>
  );
}
