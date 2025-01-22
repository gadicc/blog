import { Chip, Container, Typography } from "@mui/material";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { vscDarkPlus as style } from "react-syntax-highlighter/dist/esm/styles/prism";
import style from "./vcsDarkPlusMod";

import { formatDate } from "@/lib/format";
import { Post } from "@/schemas";
import Copyright from "@/copyright";
import { PostCategories } from "@/app/categories";
import PostViews from "@/lib/PostViews";

const remarkPlugins = [remarkGfm];
const components = {
  code(props) {
    const { children, className, node, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");
    return match ? (
      <SyntaxHighlighter
        {...rest}
        PreTag="div"
        children={String(children).replace(/\n$/, "")}
        language={match[1]}
        style={style}
      />
    ) : (
      <code {...rest} className={className}>
        {children}
      </code>
    );
  },
};

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
      <div
        style={
          {
            // textAlign: "justify"
          }
        }
      >
        <Markdown remarkPlugins={remarkPlugins} components={components}>
          {post.src}
        </Markdown>
      </div>
      {!preview && <PostViews _id={post._id.toString()} />}
      <Copyright post={post} />
    </Container>
  );
}
