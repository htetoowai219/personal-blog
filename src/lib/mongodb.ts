import { MongoClient, Db } from "mongodb";

const dbName = process.env.MONGODB_DB || "personal_blog";

function getUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "MONGODB_URI environment variable is required in production. Set it in your Vercel project settings."
      );
    }
    return "mongodb://localhost:27017/";
  }
  return uri;
}

interface MongoCache {
  client?: MongoClient;
  db?: Db;
  connecting?: Promise<{ client: MongoClient; db: Db }> | undefined;
}

const globalForMongo = globalThis as unknown as { __mongoCache?: MongoCache };
const cache: MongoCache = (globalForMongo.__mongoCache ??= {});

export async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cache.client && cache.db) {
    return { client: cache.client, db: cache.db };
  }

  if (!cache.connecting) {
    cache.connecting = (async () => {
      const client = new MongoClient(getUri(), {
        maxIdleTimeMS: 60000,
        serverSelectionTimeoutMS: 10000,
      });
      await client.connect();
      const db = client.db(dbName);
      return { client, db };
    })();
  }

  try {
    const { client, db } = await cache.connecting;
    cache.client = client;
    cache.db = db;
    return { client, db };
  } catch (error) {
    cache.connecting = undefined;
    throw error;
  }
}
