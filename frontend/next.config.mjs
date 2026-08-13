/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Bake in the API URL so it's always available even if env var is missing
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      'https://duolingo-clone-6092.onrender.com/api',
    NEXT_PUBLIC_GOOGLE_CLIENT_ID:
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      '891167565350-6bgbmm3gbqrrba6fdk54lfm4g6ts6f8b.apps.googleusercontent.com',
  },
};

export default nextConfig;
