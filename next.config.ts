import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `next dev` and `next build` both write to `.next` by default, so running a
   * build while the dev server is up corrupts it — the dev server then serves a
   * 500 for the document and 404s for its chunks. Set NEXT_DIST_DIR to build
   * into a scratch directory instead:
   *
   *   NEXT_DIST_DIR=.next-verify npm run build
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
