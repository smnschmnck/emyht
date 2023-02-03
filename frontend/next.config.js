/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['emyht.fra1.digitaloceanspaces.com', 'cdn.emyht.com'],
  },
}

module.exports = nextConfig
