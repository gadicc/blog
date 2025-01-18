import { Chip, Container, Typography } from "@mui/material";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { formatDate } from "@/lib/format";
import { Post } from "@/schemas";

export default function RenderPost({ post }: { post: Post }) {
  return (
    <Container>
      <Typography variant="h5">{post.title}</Typography>
      {formatDate(post.createdAt)} by gadicc
      <span>
        {post.tags?.map((tag) => (
          <Chip key={tag} label={tag} />
        ))}
      </span>
      <Markdown remarkPlugins={[remarkGfm]}>{post.src}</Markdown>
    </Container>
  );
}
