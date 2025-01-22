import { Chip, Container, Typography } from "@mui/material";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate } from "@/lib/format";
import { Post } from "@/schemas";
import Copyright from "@/copyright";
import { PostCategories } from "@/app/categories";
import PostViews from "@/lib/PostViews";

export default function RenderPost({
  post,
  preview,
}: {
  post: Post;
  preview?: boolean;
}) {
  const createdAt =
    typeof post.createdAt === "string"
      ? new Date(post.createdAt)
      : post.createdAt;

  return (
    <Container>
      <Typography variant="h5">{post.title}</Typography>
      {formatDate(createdAt)} by gadicc in <PostCategories post={post} />
      <span>
        {post.tags?.map((tag) => (
          <Chip key={tag} label={tag} />
        ))}
      </span>
      <div style={{ textAlign: "justify" }}>
        <Markdown remarkPlugins={[remarkGfm]}>{post.src}</Markdown>
      </div>
      {!preview && <PostViews _id={post._id.toString()} />}
      <Copyright post={post} />
    </Container>
  );
}
