import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { unstable_cache } from "next/cache";
import { db } from "@/api-lib/db";
import RenderPost from "../../post/[_id]/renderPost";
import { Container } from "@mui/material";
import { auth } from "@/auth";
import Link from "@/lib/link";
import { Post } from "@/schemas";
import { redirect } from "next/navigation";

export const revalidate = 60;
export const dynamicParams = true;

const Posts = db.collection<Post>("posts");

function getPostByIncrId(incrId: number) {
  return unstable_cache(
    () => Posts.findOne({ incrId }),
    undefined, // [incrId],
    { revalidate: 60 } // 60s i.e. 1m
  )();
}

type Props = {
  params: Promise<{ idSlug: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

function extractIncrIdAndSlug(idSlug: string) {
  const [incrId, slug] = (() => {
    const m = idSlug.match(/^(\d+)-(.+)$/);
    if (!m) return [null, null];
    return [parseInt(m[1]), m[2]];
  })();

  return { incrId, slug };
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { idSlug } = await params;
  const { incrId, slug } = extractIncrIdAndSlug(idSlug);
  if (!(incrId && slug)) throw new Error("invalid idSlug: " + idSlug);

  const post = await getPostByIncrId(incrId);
  if (!post) throw new Error("could not find post with incrId: " + incrId);

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    openGraph: {
      // images: ["/some-specific-page-image.jpg", ...previousImages],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { idSlug } = await params;
  const { incrId, slug } = extractIncrIdAndSlug(idSlug);
  if (!(incrId && slug)) throw new Error("invalid idSlug: " + idSlug);

  const post = await getPostByIncrId(incrId);
  if (!post) throw new Error("could not find post with incrId: " + incrId);

  if (post.slug !== slug) {
    // redirect to correct slug
    redirect(`/p/${incrId}-${post.slug}`);
  }

  const session = await auth();
  const admin = session?.user?.admin;

  return (
    <Container sx={{ my: 2 }}>
      <RenderPost post={post} />
      {admin && <Link href={`/post/${post._id}/edit`}>Edit</Link>}
    </Container>
  );
}
