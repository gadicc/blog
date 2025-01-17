"use client";
console.log("db.ts");
import db, { Collection } from "gongo-client";
// import { getSession } from "next-auth/react";
import HTTPTransport from "gongo-client/lib/transports/http";
// import GongoAuth from "gongo-client/lib/auth";
import type { UserClient, Post, PostRevision } from "./schemas";

db.extend("transport", HTTPTransport, {
  pollInterval: 60 * 1000,
  // pollInterval: false,
  pollWhenIdle: false,
  idleTimeout: 60 * 1000,
});

// db.subscribe("user");
// db.collection("users").persist();
db.collection("posts").persist();
db.collection("postRevisions").persist();

declare module "gongo-client" {
  interface Database {
    collection(name: "users"): Collection<UserClient>;
    collection(name: "posts"): Collection<Post>;
    collection(name: "postRevisions"): Collection<PostRevision>;
  }
}

// @ts-expect-error: i know
if (typeof window !== "undefined") window.db = db;

export default db;
