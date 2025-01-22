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

gs.publish("post", async (db, opts) => {
  // const session = await auth();
  const strId = opts._id as string;
  if (!strId) return [];

  const _id = new ObjectId(strId);
  return db.collection("posts").find({ _id });
});

gs.publish("postRevisions", async (db, opts) => {
  // const session = await auth();
  const strId = opts.postId as string;
  if (!strId) return [];

  const postId = new ObjectId(strId);
  return db.collection("postRevisions").find({ postId });
});

if (gs.dba) {
  const db = gs.dba;

  interface Counter {
    _id: string;
    count: number;
  }
  const Counters = await db.collection<Counter>("counters").getReal();
  async function getCounter(name: string) {
    const result = await Counters.findOneAndUpdate(
      { _id: name },
      { $inc: { count: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    return result?.count;
  }

  const PageCounts = await db.collection("pageCounts").getReal();
  async function getPageCountIncr(
    _id: ObjectId | string,
    metric: "views" | "interactions" = "views"
  ) {
    if (typeof _id === "string") _id = new ObjectId(_id);
    const result = await PageCounts.findOneAndUpdate(
      { _id },
      { $inc: { [metric]: 1 } },
      { upsert: true, returnDocument: "after" }
    );
    return result?.[metric];
  }

  gs.method("getCounter", async (db, opts, { auth }) => {
    const userId = await auth.userId();
    if (!userId) return null;

    const user = await db.collection("users").findOne({ _id: userId });
    if (!user?.admin) return null;

    if (typeof opts !== "string") return null;

    const name = opts; // opts.name as string;
    const result = await getCounter(name);
    console.log({ name, result });
    return result;
  });

  gs.method(
    "getPageCountIncr",
    async (
      db,
      { _id, metric }: { _id: string; metric?: "views" | "interactions" }
    ) => {
      if (!metric) metric = "views";

      const result = await getPageCountIncr(_id, metric);
      console.log({ _id, metric, result });
      return result;
    }
  );

  for (const collName of ["users", "posts", "postRevisions"]) {
    const coll = db.collection(collName);
    coll.allow("insert", userIsAdmin);
    coll.allow("update", userIsAdmin);
    coll.allow("remove", userIsAdmin);
  }

  const Posts = db.collection("posts");

  // @ts-expect-error: gongo
  Posts.on("preInsertMany", async (props, { entries }) => {
    const coll = await Posts.getReal();

    for (const doc of entries) {
      doc.incrId = await getCounter("posts");
    }
  });
}

// https://github.com/nextauthjs/next-auth/issues/12224
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const POST = (await auth(gs.vercelEdgePost())) as any;
