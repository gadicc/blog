import React from "react";
// import { unstable_cache } from "next/cache";
import { Chip, Container, Typography } from "@mui/material";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { db, fetchOptionsOnce } from "@/api-lib/db";
import { Post } from "@/schemas";
import Link from "@/lib/link";
import { formatDate } from "@/lib/format";
import { post2url } from "@/lib/posts";
import { PostCategories } from "./categories";
import Copyright from "@/copyright";

export const revalidate = 60;
export const dynamicParams = true;

const remarkPlugins = [remarkGfm];
const Posts = db.collection<Post>("posts");

function getPosts() {
  fetchOptionsOnce({ next: { revalidate: 60 } });
  return Posts.find({ __deleted: { $exists: false } })
    .sort({ createdAt: -1 })
    .toArray();
}

/*
const getPostsCached = () =>
  unstable_cache(
    getPosts,
    undefined,
    { revalidate: 60 } // 60s i.e. 1m
  )();
*/

const TRUNCATE_LENGTH = 255;
function PostRow({ post }: { post: Post }) {
  const length = post.src.length;
  const isTruncated = length > TRUNCATE_LENGTH;
  const src = isTruncated ? post.src.substring(0, TRUNCATE_LENGTH) : post.src;

  return (
    <li style={{ marginBottom: 20 }}>
      <Link href={post2url(post)}>
        <Typography variant="h5">{post.title}</Typography>
      </Link>
      <div>
        {formatDate(post.createdAt)} in <PostCategories post={post} />
      </div>
      {post.tags ? (
        <div style={{ marginBottom: 20 }}>
          {post.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ marginRight: 0.5 }}
            />
          ))}
        </div>
      ) : null}
      <div
        style={
          {
            // textAlign: "justify"
          }
        }
      >
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

  return (
    <Container>
      <ul
        style={{
          listStyleType: "none",
          paddingInlineStart: 0,
        }}
      >
        {posts.map((post) => (
          <PostRow key={post._id} post={post} />
        ))}
      </ul>
      <Copyright />
    </Container>
  );
}

export default Index;
