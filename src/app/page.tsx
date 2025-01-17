import { Container } from "@mui/material";
import React from "react";
import { db } from "@/api-lib/db";
import { Post } from "@/schemas";
import Link from "@/lib/link";
import { unstable_cache } from "next/cache";
import { formatDate } from "@/lib/format";

const Posts = db.collection<Post>("posts");

function getPosts() {
  return unstable_cache(
    () =>
      Posts.find({ __deleted: { $exists: false } })
        .sort({ createdAt: -1 })
        .toArray(),
    [],
    { revalidate: 60 } // 60s i.e. 1m
  )();
}

function PostRow({ post }: { post: Post }) {
  return (
    <li>
      <Link href={`/post/${post._id}`}>{post.title}</Link>
      <br />
      {formatDate(post.createdAt)}
    </li>
  );
}

async function Index() {
  const posts = process.env.MONGO_URL ? await getPosts() : [];

  return (
    <Container>
      <ul>
        {posts.map((post) => (
          <PostRow key={post._id} post={post} />
        ))}
      </ul>
    </Container>
  );
}

export default Index;
