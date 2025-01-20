import type { Post } from "@/schemas";

export function post2url(post: Post, prefix = "") {
  const path = post.incrId
    ? `/p/${post.incrId}-${post.slug}`
    : `/post/${post._id}`;
  return prefix + path;
}
