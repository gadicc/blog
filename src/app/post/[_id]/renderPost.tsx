import { Container, Typography } from "@mui/material";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function RenderPost({ post }) {
  return (
    <Container>
      <Typography variant="h5">{post.title}</Typography>
      <Markdown remarkPlugins={[remarkGfm]}>{post.src}</Markdown>
    </Container>
  );
}
