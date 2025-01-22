"use client";
// Note, switch to Partial Prerendering once it enters GA
// https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering

import React from "react";
import db from "@/db";

export default function PageViews({
  _id,
  metric = "views",
}: {
  _id: string;
  metric?: "views" | "interactions";
}) {
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      const count = (await db.call("getPageCountIncr", {
        _id,
        metric,
      })) as unknown as number;
      // console.log({ count });
      setCount(count);
    })();
  }, []);

  return (
    <div>
      <small>This post has been viewed {count || "a few"} times.</small>
    </div>
  );
}
