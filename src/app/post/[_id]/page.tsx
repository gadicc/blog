import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { unstable_cache } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { db, ObjectId } from "@/api-lib/db";
import RenderPost from "./renderPost";
import { Container } from "@mui/material";
import { auth } from "@/auth";
import Link from "@/lib/link";
import { Post } from "@/schemas";

export const revalidate = 60;
export const dynamicParams = true;

const Posts = db.collection<Post>("posts");

function getPost(_id: string) {
  return unstable_cache(
    // @ts-expect-error: TODO, client/server _id type mismatch
    () => Posts.findOne({ _id: new ObjectId(_id) }),
    [_id],
    { revalidate: 60 } // 60s i.e. 1m
  )();
}

type Props = {
  params: Promise<{ _id: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { _id } = await params;
  const post = await getPost(_id);
  if (!post) throw new Error("could not find post with _id: " + _id);

  const parent = await _parent;

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    openGraph: {
      // images: ["/some-specific-page-image.jpg", ...previousImages],
    },
    keywords: [...(parent.keywords || []), ...(post.tags || [])],
  };
}

export default async function PostPage({ params }: Props) {
  const { _id } = await params;
  if (!_id) return "No _id provided";

  const post = await getPost(_id);
  const session = await auth();
  const admin = session?.user?.admin;

  if (!post) {
    // return "No post found with _id: " + _id;
    notFound();
  }

  if (post.incrId) {
    redirect(`/p/${post.incrId}-${post.slug}`);
  }

  return (
    <Container sx={{ my: 2 }}>
      <RenderPost post={post} />
      {admin && <Link href={`/post/${_id}/edit`}>Edit</Link>}
    </Container>
  );
}
