// Note, switch to Partial Prerendering once it enters GA
// https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering

import React from "react";
import { geolocation } from "@vercel/functions";
import { headers as getHeaders } from "next/headers";
import { db, ObjectId, fetchOptionsOnce } from "@/api-lib/db";
import getUnicodeFlagIcon from "country-flag-icons/unicode";

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
        .sort({ [metric]: -1 })
        .limit(5)
        .toArray();
    })(),
    topRefererHostnames: (async () => {
      fetchOptionsOnce({ next: { revalidate: 60 } });
      return PageCountsRefererHostnames.find({ postId })
        .sort({ [metric]: -1 })
        .limit(5)
        .toArray();
    })(),
    // writePromise: sendUpdates(_id.toHexString(), metric, { country, referer }),
  };

  const writePromises = {
    pageCount: PageCounts.updateOne(
      { postId },
      { $inc: { [metric]: 1 } },
      { upsert: true }
    ),
    pageCountCountries: PageCountsCountry.updateOne(
      { postId, country },
      { $inc: { [metric]: 1 } },
      { upsert: true }
    ),
    pageCountReferers: PageCountsReferers.updateOne(
      { postId, referer },
      { $inc: { [metric]: 1 } },
      { upsert: true }
    ),
    pageCountRefererHostnames: PageCountsRefererHostnames.updateOne(
      { postId, hostname },
      { $inc: { [metric]: 1 } },
      { upsert: true }
    ),
  };

  console.log(await resolveObject(writePromises));

  return resolveObject(readPromises);
}

const pctPar = (n, d, p = 0) =>
  "(" + (d ? ((n / d) * 100).toFixed(p) : 0) + "%)";

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
    <div style={{ fontSize: "80%", textAlign: "center" }}>
      <span>This post has been viewed {views} times.</span>
      <br />
      <span>
        {" "}
        Top countries:{" "}
        {pageData.topCountries?.map((c, i) => {
          // c.country = 'za';
          const unicode = c.country && getUnicodeFlagIcon(c.country);
          return (
            <span key={i}>
              {unicode ? (
                <a title={c.country} style={{ cursor: "pointer" }}>
                  {getUnicodeFlagIcon(c.country)}
                </a>
              ) : (
                c.country || "Unknown"
              )}{" "}
              {pctPar(c.views, views)}
              {i < pageData.topCountries.length - 1 ? ", " : "."}
            </span>
          );
        })}
      </span>
      <br />
      <span>
        Top referers:{" "}
        {pageData.topRefererHostnames?.map((r, i) => {
          // r.hostname = "www.google.com";
          const url = r.hostname && "http://" + r.hostname + "/favicon.ico";
          return (
            <span key={r.hostname}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                title={r.hostname}
                alt={r.hostname + " favicon"}
                style={{ width: 16, height: 16, verticalAlign: "middle" }}
              />{" "}
              {pctPar(r.views, views)}
              {i < pageData.topRefererHostnames.length - 1 ? ", " : "."}
            </span>
          );
        })}
      </span>
      <br />
      <span>These stats are cached and do not update immediately.</span>
    </div>
  );
}
