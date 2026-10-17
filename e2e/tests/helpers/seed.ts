import dotenv from 'dotenv';
import { MongoClient, type Db } from 'mongodb';
import bcrypt from 'bcryptjs';
import path from 'node:path';

/**
 * Seeds test accounts directly into the MongoDB database the ez-shop server
 * uses (reads MONGO_URI from server/.env). This bypasses the email-OTP signup
 * flow, which cannot be completed in an unattended e2e run.
 *
 * Accounts are created/updated idempotently (upsert by email) so re-running
 * the suite is safe.
 */
dotenv.config({ path: path.resolve(__dirname, '../../../server/.env') });

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  throw new Error('MONGO_URI is missing from server/.env');
}

const uri: string = MONGO_URI;
const dbName: string = new URL(uri).pathname.replace(/^\//, '') || 'test';

let clientPromise: Promise<MongoClient> | null = null;

function getClient(): Promise<MongoClient> {
  if (!clientPromise) {
    clientPromise = new MongoClient(uri).connect();
  }
  return clientPromise as Promise<MongoClient>;
}

export interface SeedAccount {
  email: string;
  password: string;
  name: string;
}

/** Insert/update a customer account with a bcrypt-hashed password. */
export async function seedUser(account: SeedAccount): Promise<void> {
  const client = await getClient();
  const db: Db = client.db(dbName);
  const passwordHash = await bcrypt.hash(account.password, 10);
  await db.collection('users').updateOne(
    { email: account.email },
    {
      $setOnInsert: {
        name: account.name,
        email: account.email,
        role: 'User',
        isEmailVerified: true,
        isProfileCompleted: true,
      },
      $set: { password: passwordHash },
    },
    { upsert: true },
  );
}

/** Insert/update an admin account with a bcrypt-hashed password. */
export async function seedAdmin(account: SeedAccount): Promise<void> {
  const client = await getClient();
  const db: Db = client.db(dbName);
  const passwordHash = await bcrypt.hash(account.password, 10);
  await db.collection('admins').updateOne(
    { email: account.email },
    {
      $setOnInsert: {
        name: account.name,
        email: account.email,
        role: 'Admin',
      },
      $set: { password: passwordHash },
    },
    { upsert: true },
  );
}

export async function deleteUser(email: string): Promise<void> {
  const client = await getClient();
  const db: Db = client.db(dbName);
  await db.collection('users').deleteOne({ email });
}

export async function deleteAdmin(email: string): Promise<void> {
  const client = await getClient();
  const db: Db = client.db(dbName);
  await db.collection('admins').deleteOne({ email });
}

export async function closeSeedDb(): Promise<void> {
  if (clientPromise) {
    const client = await clientPromise;
    await client.close();
    clientPromise = null;
  }
}
