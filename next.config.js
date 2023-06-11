/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    // dùng để cho phép lấy link avatar từ account google
    domains: ["lh3.googleusercontent.com"],
  },
};

module.exports = nextConfig;
