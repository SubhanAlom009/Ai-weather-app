/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["openweathermap.org"], // 👈 allow image loading from this domain
  },
};

export default nextConfig;
