import { MongoClient } from "mongodb";
import makeRelay from "mongodb-rest-relay/lib/server/nextServerlessApp";

const MONGO_URL = process.env.MONGO_URL || "mongodb://127.0.0.1";
const client = new MongoClient(MONGO_URL);

// ts fails sometimes here (but not always???) because of version mismatch
// @ ts-expect-error: ok
const relay = makeRelay((await client.connect()).db("blog"));

export const GET = relay;
export const POST = relay;
