"use client";
import React from "react";
import {
  Autocomplete,
  Button,
  Container,
  Grid2,
  Stack,
  TextField,
} from "@mui/material";
import { useSession } from "next-auth/react";
import db from "@/db";
import { useRouter } from "next/navigation";
import RenderPost from "../renderPost";
import { useGongoOne, useGongoSub } from "gongo-client-react";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const Posts = db.collection("posts");
const PostRevisions = db.collection("postRevisions");

export default function PostEdit({
  params,
}: {
  params: Promise<{ _id: string }>;
}) {
  const [src, setSrc] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [createdAt, setCreatedAt] = React.useState(dayjs());
  const [tags, setTags] = React.useState<string[]>([]);
  const [incrId, setIncrId] = React.useState(0);
  const [slug, setSlug] = React.useState("");

  const session = useSession();
  const { _id } = React.use(params);
  const router = useRouter();
  const post = useGongoOne((db) => db.collection("posts").find({ _id }));
  useGongoSub(_id !== "new" && "post", { _id });
  useGongoSub(_id !== "new" && "postRevisions", { postId: _id });

  const userId = session.data?.user?.id?.toString();
  // console.log({ userId });

  React.useEffect(() => {
    if (post) {
      setSrc(post.src);
      setTitle(post.title);
      setCreatedAt(dayjs(post.createdAt));
      setTags(post.tags || []);
      setIncrId(post.incrId || 0);
      setSlug(post.slug || "");
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
      if (!userId) throw new Error("no userId");

      const now = new Date();

      if (_id === "new") {
        const doc = {
          title,
          src,
          userId,
          tags,
          slug,
          createdAt: createdAt.toDate(),
          updatedAt: now,
          __ObjectIDs: ["userId"],
        };
        console.log(doc);
        const insertedDoc = Posts.insert(doc);
        const _id = insertedDoc._id;
        if (!_id)
          throw new Error(
            "No _id for insertedDoc: " + JSON.stringify(insertedDoc)
          );

        PostRevisions.insert({
          ...doc,
          postId: _id,
          revisionId: _id,
          createdAt: now,
          __ObjectIDs: ["userId", "postId"],
        });

        router.push(`/post/${_id}/edit`);
      } else {
        const doc = {
          title,
          src,
          createdAt: createdAt.toDate(),
          updatedAt: now,
          tags,
          slug,
        };
        console.log("update", doc);
        Posts.update({ _id }, { $set: doc });

        const er = PostRevisions.findOne({
          postId: _id,
          createdAt: { $gt: new Date(now.getTime() - 5 * 60_000) },
        });
        if (er) {
          PostRevisions.update({ _id: er._id }, { $set: doc });
        } else {
          PostRevisions.insert({
            ...doc,
            userId,
            postId: _id,
            createdAt: now,
            __ObjectIDs: ["userId", "postId"],
          });
        }
      }
    },
    [title, src, _id, router, userId, createdAt, tags, slug]
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
            <DateTimePicker
              label="Created at"
              value={createdAt}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={setCreatedAt as any}
              sx={{ mb: 2 }}
            />
            <br />
            <Autocomplete
              multiple
              options={[]}
              freeSolo
              value={tags}
              onChange={(event, newValue) => {
                setTags(newValue);
              }}
              // getOptionLabel={(option) => option.title}
              // defaultValue={[top100Films[13]]}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Tags"
                  // placeholder="Favorites"
                />
              )}
            />
            <Stack direction="row" spacing={1} sx={{ my: 2 }}>
              <TextField
                label="id"
                value={incrId}
                sx={{ width: 100 }}
                disabled
              />
              <TextField
                label="slug"
                value={slug}
                fullWidth
                onChange={(e) => setSlug(e.target.value)}
              />
            </Stack>
            <Button type="submit" variant="contained">
              Save
            </Button>
          </Grid2>
          <Grid2 size={6}>
            <RenderPost
              post={{
                _id,
                userId: userId || "",
                title,
                src,
                createdAt: createdAt.toDate(),
                updatedAt: new Date(),
                tags,
              }}
              preview
            />
          </Grid2>
        </Grid2>
      </form>
    </Container>
  );
}
