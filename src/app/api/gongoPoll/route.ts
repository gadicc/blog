import type { Filter, Document } from "mongodb";
import {
  CollectionEventProps,
  userIsAdmin,
  userIdMatches,
} from "gongo-server-db-mongo/lib/collection";
import gs, { ObjectId /* User */ } from "@/api-lib/db";
import { ChangeSetUpdate } from "gongo-server/lib/DatabaseAdapter";
import { auth } from "@/auth";

// TODO, later... with separate db.ts and db-full.ts and mongodb-rest-relay.
// export const runtime = "edge";

// gs.db.Users.ensureAdmin("dragon@wastelands.net", "initialPassword");

/*
gs.publish("user", async (db, opts, { auth }) => {
  const userId = await auth.userId();
  if (!userId) return [];

  const fullUser = await db.collection("users").findOne({ _id: userId });
  const user = { ...fullUser };
  delete user.services;
  delete user.password;

  return [
    {
      coll: "users",
      entries: [user],
    },
  ];
});
*/

/*
gs.publish("users", async (db, opts, { auth }) => {
  const userId = await auth.userId();
  if (!userId) return [];

  const user = await db.collection("users").findOne({ _id: userId });
  if (!user?.admin) return [];

  const query = {};
  const realUsers = await db.collection("users").getReal();
  const users = await realUsers
    .find(query, {
      projection: {
        _id: true,
        emails: true,
        displayName: true,
        admin: true,
        groupIds: true,
        groupAdminIds: true,
        __updatedAt: true,
      },
    })
    .toArray();

  return users.length
    ? [
        {
          coll: "users",
          entries: users,
        },
      ]
    : [];
});
*/

if (gs.dba) {
  const db = gs.dba;

  for (const collName of ["users", "posts", "postRevisions"]) {
    const coll = db.collection(collName);
    coll.allow("insert", userIsAdmin);
    coll.allow("update", userIsAdmin);
    coll.allow("remove", userIsAdmin);
  }
}

// https://github.com/nextauthjs/next-auth/issues/12224
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = (await auth(gs.vercelEdgePost())) as any;
