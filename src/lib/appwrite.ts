import { Client, Account, Databases, Storage, Functions } from 'appwrite';

const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

export const appwriteConfig = {
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
    groupsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_GROUPS_COLLECTION_ID!,
    expensesCollectionId: process.env.NEXT_PUBLIC_APPWRITE_EXPENSES_COLLECTION_ID!,
    settlementsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_SETTLEMENTS_COLLECTION_ID!,
    notificationsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_NOTIFICATIONS_COLLECTION_ID!,
};

export { ID } from 'appwrite';