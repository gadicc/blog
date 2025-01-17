"use client";
import React from "react";
import { Button, Container, Grid2, TextField } from "@mui/material";
import { useSession } from "next-auth/react";
import db from "@/db";
import { useRouter } from "next/navigation";
import RenderPost from "../renderPost";
import { useGongoOne, useGongoSub } from "gongo-client-react";

const Posts = db.collection("posts");

export default function PostEdit({
  params,
}: {
  params: Promise<{ _id: string }>;
}) {
  const [src, setSrc] = React.useState("");
  const [title, setTitle] = React.useState("");
  const session = useSession();
  const { _id } = React.use(params);
  const router = useRouter();
  const post = useGongoOne((db) => db.collection("posts").find({ _id }));
  const userId = session.data?.user?._id?.toString();

  useGongoSub(_id !== "new" && "post", { _id });

  React.useEffect(() => {
    if (post) {
      setSrc(post.src);
      setTitle(post.title);
    }
  }, [post]);

  const setSrcHandler = React.useCallback(
    (e) => setSrc(e.target.value),
    [setSrc]
  );
  const setTitleHandler = React.useCallback(
    (e) => setTitle(e.target.value),
    [setTitle]
  );

  const save = React.useCallback(
    (e) => {
      e.preventDefault();

      const now = new Date();

      if (_id === "new") {
        const doc = {
          title,
          src,
          userId: userId as string,
          createdAt: now,
          updatedAt: now,
          __ObjectIDs: ["userId"],
        };
        console.log(doc);
        const insertedDoc = Posts.insert(doc);
        const _id = insertedDoc._id;
        router.push(`/post/${_id}/edit`);
      } else {
        const doc = { title, src, updatedAt: now };
        console.log("update", doc);
        Posts.update({ _id }, { $set: doc });
      }
    },
    [title, src, _id, router, userId]
  );

  if (session?.status !== "authenticated") return "Log in first";

  return (
    <Container sx={{ my: 3 }}>
      <form onSubmit={save}>
        <Grid2 container spacing={2}>
          <Grid2 size={6}>
            <TextField
              label="Title"
              value={title}
              onChange={setTitleHandler}
              fullWidth
              sx={{ mb: 2 }}
            />
            <TextField
              label="Source"
              value={src}
              onChange={setSrcHandler}
              multiline
              fullWidth
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained">
              Save
            </Button>
          </Grid2>
          <Grid2 size={6}>
            <RenderPost post={{ title, src }} />
          </Grid2>
        </Grid2>
      </form>
    </Container>
  );
}
