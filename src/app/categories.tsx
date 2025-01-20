import { Post } from "@/schemas";

interface Category {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  image?: string;
}

export const categories: Category[] = [
  {
    id: "tech",
    name: "Tech, Coding, Sysadmin",
    // description: "My Health & Wellness Journey",
    tags: ["tech", "coding", "sysadmin"],
    // image: "/science.jpg",
  },
  {
    id: "wellness",
    name: "Health & Wellness",
    // description: "My Health & Wellness Journey",
    tags: ["wellness", "me/cfs"],
    // image: "/science.jpg",
  },
  {
    id: "spirit",
    name: "Spirituality & Magick",
    description: "My Health & Wellness Journey",
    tags: ["magick", "spirituality"],
    // image: "/science.jpg",
  },
];

export function post2cats(post: Post) {
  return categories.filter((cat) =>
    post.tags?.some((tag) => cat.tags?.includes(tag))
  );
}

export function PostCategories({ post }: { post: Post }) {
  const cats = post2cats(post);
  if (!cats.length) return <i>Uncategorized</i>;

  return (
    <span>
      {cats.map((cat, i) => (
        <span key={cat.id}>
          {cat.name}
          {i < cats.length - 1 ? ", " : ""}
        </span>
      ))}
    </span>
  );
}
