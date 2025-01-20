import { db } from "@/api-lib/db";
import { Post } from "@/schemas";
import { getServerSideSitemap } from "next-sitemap";
import { post2url } from "@/lib/posts";

const ROOT_URL = (process.env.ROOT_URL || "https://blog.gadi.cc").replace(
  /\/$/,
  ""
);

const Posts = db.collection<Post>("posts");

export async function GET(request: Request) {
  const posts = await Posts.find({ __deleted: { $exists: false } })
    .sort({ createdAt: -1 })
    .toArray();
  return getServerSideSitemap(
    posts.map((post) => ({
      loc: post2url(post, ROOT_URL),
      lastmod: post.updatedAt.toISOString(),
      // changefreq
      // priority
    }))
  );
}
