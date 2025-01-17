import React from "react";
import { unstable_cache } from "next/cache";
import { db, ObjectId } from "@/api-lib/db";
import RenderPost from "./renderPost";
import { Container } from "@mui/material";
import { auth } from "@/auth";
import Link from "@/lib/link";

function getPost(_id: string) {
  return unstable_cache(
    () => db.collection("posts").findOne({ _id: new ObjectId(_id) }),
    [_id],
    { revalidate: 60 } // 60s i.e. 1m
  )();
}

export default async function Post({
  params,
}: {
  params: Promise<{ _id: string }>;
}) {
  const { _id } = await params;
  if (!_id) return "No _id provided";

  const post = await getPost(_id);
  const session = await auth();
  const admin = session?.user?.admin;

  if (!post) return "No post found with _id: " + _id;

  return (
    <Container>
      <RenderPost post={post} />
      {admin && <Link href={`/post/${_id}/edit`}>Edit</Link>}
    </Container>
  );
}
