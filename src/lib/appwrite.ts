import { Client, Account, Databases, Storage, Functions } from "appwrite";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

// client.subscribe("account", (response) => {
//   // Callback will be executed on all account events.
//   console.log(response);
// });

// client.subscribe(
//   `databases.${process.env
//     .NEXT_PUBLIC_APPWRITE_DATABASE_ID!}.collections.${process.env
//     .NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION_ID!}.documents`
// );

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export const appwriteConfig = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  groupsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
  expensesCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_EXPENSES_COLLECTION_ID!,
  settlementsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_SETTLEMENTS_COLLECTION_ID!,
  notificationsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
};

// export { client };
export { ID } from "appwrite";
