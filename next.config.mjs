/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
    ],
  },
  experimental: {
    serverActions: {
      // Default is 1 MB — phone photos and CVs easily exceed that.
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
