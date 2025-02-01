import GongoServer from "gongo-server/lib/serverless";
import MongoDBA from "gongo-server-db-mongo";
import Auth from "gongo-server/lib/auth-class";
import Database, { /* Collection, */ ObjectId } from "gongo-server-db-mongo";
// import { MongoClient } from "mongodb";
import MongoClient, { setOptionsOnce } from "mongodb-rest-relay";

// import type { User, Order, CreditCode } from "../../src/schemas";

export const runtime = "edge";

const env = process.env;
// const MONGO_URL = env.MONGO_URL || "mongodb://127.0.0.1";
const MONGO_URL =
  "http" +
  (process.env.NODE_ENV === "production"
    ? "s://blog.gadi.cc"
    : "://localhost:3000") +
  "/api/mongoRelay";

const gs = new GongoServer({
  // @ts-expect-error: it's ok
  dba: new MongoDBA(MONGO_URL, "blog", MongoClient),
});

const db = gs.dba;
const dba = gs.dba;

/*
declare module "gongo-server" {
  class Database {
    collection(name: "users"): Collection<User>;
  }
}
*/

// https://nextjs.org/docs/app/api-reference/functions/fetch
export function fetchOptionsOnce(opts: RequestInit) {
  setOptionsOnce({ fetch: opts });
}

export { db, dba, Auth, Database, ObjectId /* User, Order, CreditCode */ };
export default gs;
