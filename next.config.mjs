/** @type {import("next").NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  output: "standalone",
  images: { unoptimized: true },
  basePath: "/brk-mgmt",
  skipTrailingSlashRedirect: true,
}

export default nextConfig