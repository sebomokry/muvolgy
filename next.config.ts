import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The Könyvfesztivál demo is a self-contained static page in
  // public/konyvfesztival/index.html (built from konyvfesztival/). Next only
  // serves public files by exact path, so map the folder URL onto it.
  // The Fafesztivál "Infó" tab became the section's home page.
  async redirects() {
    return [{ source: "/fafesztival/info", destination: "/fafesztival", permanent: true }];
  },
  async rewrites() {
    return [
      {
        source: "/konyvfesztival",
        destination: "/konyvfesztival/index.html",
      },
    ];
  },
};

export default nextConfig;
