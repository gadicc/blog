import React from "react";
import type { Post } from "@/schemas";

export default function Copyright({
  post,
}: {
  post?: { createdAt?: Date | string };
}) {
  const date = post?.createdAt
    ? typeof post.createdAt === "string"
      ? new Date(post.createdAt)
      : post.createdAt
    : new Date();
  const year = date.getFullYear();

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <small>
        &copy; {year} by Gadi Cohen. All rights reserved.
        <br />
        All blog content is provided "as is". USE AT YOUR OWN RISK.
        <br />I cannot be held responsible for any loss or damage that may occur
        to you, your projects, property, health, or life.
      </small>
    </div>
  );
}
