/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    // Ensure the destination includes /api/:path* correctly
    const destination = apiUrl.endsWith('/api') 
      ? `${apiUrl}/:path*` 
      : apiUrl.includes(':path*') 
        ? apiUrl 
        : `${apiUrl}/api/:path*`;

    return [
      {
        source: '/api/:path*',
        destination: destination,
      },
    ];
  },
};

export default nextConfig;
