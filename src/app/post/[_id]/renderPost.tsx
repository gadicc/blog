import { Chip, Container, Typography } from "@mui/material";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate } from "@/lib/format";
import { Post } from "@/schemas";
import Copyright from "@/copyright";
import { PostCategories } from "@/app/categories";

export default function RenderPost({ post }: { post: Post }) {
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
      <Markdown remarkPlugins={[remarkGfm]}>{post.src}</Markdown>
      <Copyright post={post} />
    </Container>
  );
}
