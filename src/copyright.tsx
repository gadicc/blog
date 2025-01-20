import React from "react";
import type { Post } from "@/schemas";

export default function Copyright({ post }: { post?: { createdAt?: Date } }) {
  const date = post?.createdAt || new Date();
  const year = date.getFullYear();

  return (
    <div style={{ textAlign: "center", padding: "20px 0" }}>
      <small>&copy; {year} by Gadi Cohen. All rights reserved.</small>
    </div>
  );
}
