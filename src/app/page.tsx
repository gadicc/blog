import { Container, Typography } from "@mui/material";
import React from "react";
import { db } from "@/api-lib/db";
import { Post } from "@/schemas";
import Link from "@/lib/link";
import { unstable_cache } from "next/cache";
import { formatDate } from "@/lib/format";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const remarkPlugins = [remarkGfm];

const Posts = db.collection<Post>("posts");

function getPosts() {
  return unstable_cache(
    () =>
      Posts.find({ __deleted: { $exists: false } })
        .sort({ createdAt: -1 })
        .toArray(),
    undefined,
    { revalidate: 60 } // 60s i.e. 1m
  )();
}

const TRUNCATE_LENGTH = 255;
function PostRow({ post }: { post: Post }) {
  const length = post.src.length;
  const isTruncated = length > TRUNCATE_LENGTH;
  const src = isTruncated ? post.src.substring(0, TRUNCATE_LENGTH) : post.src;

  return (
    <li>
      <Link href={`/post/${post._id}`}>
        <Typography variant="h5">{post.title}</Typography>
      </Link>
      <div>{formatDate(post.createdAt)}</div>
      <div>
        {post.tags?.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div>
        <Markdown remarkPlugins={remarkPlugins}>
          {post.src.substring(0, 255) + (isTruncated ? "..." : "")}
        </Markdown>
      </div>
      <div>
        <a href={`/post/${post._id}`}>Read more</a>
      </div>
    </li>
  );
}

async function Index() {
  const posts =
    process.env.NEXT_PHASE === "phase-production-build" ? [] : await getPosts();
  console.log("posts", posts);

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
