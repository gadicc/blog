import { ReadonlyURLSearchParams } from "next/navigation";

export type PathnameValue =
  | string
  | (({
      pathname,
      searchParams,
    }: {
      pathname: string;
      searchParams: ReadonlyURLSearchParams | null;
    }) => string);

const pathnames: {
  [key: string]: PathnameValue | typeof pathnames;
} = {
  "/": "Home",
};

export default pathnames;
