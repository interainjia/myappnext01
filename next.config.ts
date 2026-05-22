/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. 开启纯静态导出
  output: 'export',
  
  // 2. 必须关闭内置的图片优化（因为没有 Node.js 服务器来实时压缩图片）
  images: {
    unoptimized: true,
  },

  // 注意：这里绝对不能再写 rewrites() 函数了！
};

export default nextConfig;