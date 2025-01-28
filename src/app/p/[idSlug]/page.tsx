import React from "react";
import type { Metadata, ResolvingMetadata } from "next";
import { unstable_cache } from "next/cache";
import { db } from "@/api-lib/db";
import RenderPost from "../../post/[_id]/renderPost";
import { Container } from "@mui/material";
import { auth } from "@/auth";
import Link from "@/lib/link";
import { Post } from "@/schemas";
import { redirect, notFound } from "next/navigation";
import { get } from "react-hook-form";

export const revalidate = 60;
export const dynamicParams = true;

const Posts = db.collection<Post>("posts");

function getPostByIncrId(incrId: number) {
  return unstable_cache(
    () => Posts.findOne({ incrId }),
    [incrId.toString()],
    { revalidate: 60 } // 60s i.e. 1m
  )();
}

function getPostBySlug(slug: string) {
  return unstable_cache(
    () => Posts.findOne({ slug }),
    [slug],
    { revalidate: 60 } // 60s i.e. 1m
  )();
}

type Props = {
  params: Promise<{ idSlug: string }>;
  // searchParams: Promise<{ [key: string]: string | string[] | undefined }>
};

function extractIncrIdAndSlug(idSlug: string) {
  const [incrId, slug] = (() => {
    const m = idSlug.match(/^((?<incrId>\d+)-)?(?<slug>.+)$/);
    if (!m) return [null, null];
    return [parseInt(m.groups!.incrId), m.groups!.slug];
  })();

  return { incrId, slug };
}

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { idSlug } = await params;
  const post = await getPostByIdSlug(idSlug);

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

export async function getPostByIdSlug(idSlug: string) {
  const { incrId, slug } = extractIncrIdAndSlug(idSlug);
  if (!(incrId || slug)) throw new Error("invalid idSlug: " + idSlug);

  let post;

  if (incrId) {
    post = await getPostByIncrId(incrId);
  } else if (slug) {
    post = await getPostBySlug(slug);
  }

  if (!post && incrId && slug) {
    // Slug that starts with a number
    post = await getPostBySlug(idSlug);
  }

  if (!post) {
    notFound();
  }

  if (!(post.slug === slug && post.incrId === incrId)) {
    redirect(`/p/${post.incrId}-${post.slug}`);
  }

  return post;
}

export default async function PostPage({ params }: Props) {
  const { idSlug } = await params;
  const post = await getPostByIdSlug(idSlug);

  const session = await auth();
  const admin = session?.user?.admin;

  return (
    <Container sx={{ my: 2 }}>
      <RenderPost post={post} />
      {admin && <Link href={`/post/${post._id}/edit`}>Edit</Link>}
    </Container>
  );
}
