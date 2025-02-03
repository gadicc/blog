// Note, switch to Partial Prerendering once it enters GA
// https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering

import React from "react";
import { geolocation } from "@vercel/functions";
import { headers as getHeaders } from "next/headers";
import { db, ObjectId, fetchOptionsOnce } from "@/api-lib/db";

export const dynamic = "force-dynamic";

const PageCounts = await (await db.collection("pageCounts")).getReal();
const PageCountsCountry = await (
  await db.collection("pageCountsCountry")
).getReal();
const PageCountsReferers = await (
  await db.collection("pageCountsReferers")
).getReal();
const PageCountsRefererHostnames = await (
  await db.collection("pageCountsRefererHostnames")
).getReal();

// https://stackoverflow.com/a/64915904/1839099
function resolveObject(obj) {
  return Promise.all(
    Object.entries(obj).map(async ([k, v]) => [k, await v])
  ).then(Object.fromEntries);
}

/*
async function sendUpdates(_id, metric, { country, referer }) {
  const result = await fetch(`${process.env.ROOT_URL}/api/postViews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ _id, metric, country, referer }),
  });

  console.log("result", result);
  // console.log("text", await result.text());
}
*/

async function getPageCountIncr(
  _id: ObjectId | string,
  metric: "views" | "interactions" = "views"
) {
  const headers = await getHeaders();
  const geo = geolocation({ headers });
  const { country } = geo;

  const referer = headers.get("referer");
  const refUrl = referer ? new URL(referer) : null;
  const hostname = refUrl?.hostname;

  const extra = {} as { [key: string]: number };
  if (country) extra[`${metric}ByCountry.${country}`] = 1;

  if (typeof _id === "string") _id = new ObjectId(_id);
  const postId = _id;

  const readPromises = {
    pageCount: (async () => {
      fetchOptionsOnce({ next: { revalidate: 60 } });
      return PageCounts.findOne({ postId });
    })(),
    topCountries: (async () => {
      fetchOptionsOnce({ next: { revalidate: 60 } });
      return PageCountsCountry.find({ postId })
        .sort({ count: -1 })
        .limit(5)
        .toArray();
    })(),
    topRefererHostnames: (async () => {
      fetchOptionsOnce({ next: { revalidate: 60 } });
      return PageCountsRefererHostnames.find({ postId })
        .sort({ count: -1 })
        .limit(5)
        .toArray();
    })(),
    // writePromise: sendUpdates(_id.toHexString(), metric, { country, referer }),
  };

  const writePromises = {
    pageCount: PageCounts.findOneAndUpdate(
      { postId },
      { $inc: { [metric]: 1 } },
      { upsert: true }
    ),
    pageCountCountries: PageCountsCountry.findOneAndUpdate(
      { postId, country },
      { $inc: { [metric]: 1 } },
      { upsert: true }
    ),
    pageCountReferers: PageCountsReferers.findOneAndUpdate(
      { postId, referer },
      { $inc: { [metric]: 1 } },
      { upsert: true }
    ),
    pageCountRefererHostnames: PageCountsRefererHostnames.findOneAndUpdate(
      { postId, hostname },
      { $inc: { [metric]: 1 } },
      { upsert: true }
    ),
  };

  console.log(await resolveObject(writePromises));

  return resolveObject(readPromises);
}

export default async function PageViews({
  _id,
  metric = "views",
}: {
  _id: string;
  metric?: "views" | "interactions";
}) {
  const pageData = await getPageCountIncr(_id, metric);
  console.log("pageData", pageData);

  const views = pageData.pageCount?.views;

  /*
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
  }, [_id, metric]);
  */

  return (
    <div>
      <small>This post has been viewed {views} times.</small>
    </div>
  );
}
