/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "res.cloudinary.com",  // for Cloudinary
      "img.youtube.com",     // for YouTube thumbnails
    ],
    formats: ["image/avif", "image/webp"],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      }
    }

    config.resolve.alias = {
      ...config.resolve.alias,
      "pdfkit": "pdfkit/js/pdfkit.standalone.js",
    }

    return config
  },
}

export default nextConfig
