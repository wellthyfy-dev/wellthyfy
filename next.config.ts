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

  images: {
    remotePatterns: [
      {
        // Course banners live in the public `course-covers` Supabase bucket.
        protocol: "https",
        hostname: "asldprpmsegjdtyvuett.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
