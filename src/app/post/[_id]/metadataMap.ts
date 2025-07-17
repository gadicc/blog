import { Post } from "@/schemas";
import type { Metadata, ResolvingMetadata } from "next";

export default async function MetadataMap(
  post: Post,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const parent = await _parent;
  // console.log("generateMetadata", post);

  // optionally access and extend (rather than replace) parent metadata
  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: post.title,
    description: post.description, //  || parent.description,
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      siteName: parent.openGraph?.siteName,
      // images: ["/some-specific-page-image.jpg", ...previousImages],
    },
    twitter: {
      title: post.title,
      description: post.description,
    },
    keywords: [...(parent.keywords || [])], // ...(post.tags || [])],
  };
}
