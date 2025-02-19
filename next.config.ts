import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        domains: ['lh3.googleusercontent.com', 'nextacm.sgp1.cdn.digitaloceanspaces.com', 'cdn.diuacm.com'],
    },
};

export default nextConfig;
