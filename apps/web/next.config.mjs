const basePath = process.env.PAGES_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fully static bundle: no Node server at runtime, so every page below fetches its data
  // client-side from NEXT_PUBLIC_API_BASE_URL instead of relying on server components/SSR.
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
