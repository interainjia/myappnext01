/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: process.env.npm_package_version ?? '0.0.0',
  },

  // 1. 开启纯静态导出（Nginx 直接托管 HTML/CSS/JS）
  //
  // ⚠️  middleware.ts 路由保护说明：
  //    - `next dev`：middleware 正常运行（Edge Runtime），路由保护完整生效
  //    - 静态部署（Nginx）：middleware 不运行，路由保护由以下两层承担：
  //        a. Nginx rewrite 规则（参见 middleware.ts 顶部注释中的配置示例）
  //        b. Dashboard Layout 客户端 token 校验（app/(dashboard)/layout.tsx）
  //
  //    如需在生产环境启用 middleware，请删除下方 `output: 'export'`，
  //    改为 Node.js 服务器部署：next start / Docker / PM2
  output: 'export',

  // 2. 必须关闭内置的图片优化（没有 Node.js 服务器来实时压缩图片）
  images: {
    unoptimized: true,
  },

  // 注意：静态导出模式下不能写 rewrites() 函数
};

export default nextConfig;