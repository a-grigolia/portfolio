/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [{ source: "/lab", destination: "/proximity", permanent: true }];
  },
};

export default nextConfig;
