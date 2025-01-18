import { db } from "@/api-lib/db";
import { Post } from "@/schemas";
import { getServerSideSitemap } from "next-sitemap";
const ROOT_URL = process.env.ROOT_URL || "https://blog.gadi.cc";

const Posts = db.collection<Post>("posts");

export async function GET(request: Request) {
  const posts = await Posts.find({ __deleted: { $exists: false } })
    .sort({ createdAt: -1 })
    .toArray();
  return getServerSideSitemap(
    posts.map((post) => ({
      loc: `${ROOT_URL}/post/${post._id}`,
      lastmod: post.updatedAt.toISOString(),
      // changefreq
      // priority
    }))
  );
}
