# Next.js 企业应用模板文档

> 基于 `my-app-next-01` 项目总结，适用于 Crown Bioscience 内部系统快速搭建

---

## 目录

1. [技术栈](#技术栈)
2. [项目结构](#项目结构)
3. [快速启动](#快速启动)
4. [环境变量](#环境变量)
5. [路由与布局设计](#路由与布局设计)
6. [认证与鉴权体系](#认证与鉴权体系)
7. [角色与权限控制](#角色与权限控制)
8. [API 对接规范](#api-对接规范)
9. [组件与页面约定](#组件与页面约定)
10. [构建与部署](#构建与部署)
11. [复用该模板的步骤](#复用该模板的步骤)

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Next.js (App Router) | 16.x |
| UI 库 | React | 19.x |
| 语言 | TypeScript | 6.x |
| CSS | Tailwind CSS v4 | 4.x |
| 图标 | lucide-react | latest |
| 表单 | react-hook-form | 7.x |
| JWT 解析 | jwt-decode | 4.x |
| 包管理 | npm | — |

> ⚠️ **注意**：使用的是 Next.js App Router（不是旧版 Pages Router），API 约定与旧版不同，请先阅读 `node_modules/next/dist/docs/` 中的文档。

---

## 项目结构

```
my-app-next-01/
├── app/                            # Next.js App Router 根目录
│   ├── layout.tsx                  # 全局根布局（html/body）
│   ├── page.tsx                    # 公开首页（Landing Page）
│   ├── globals.css                 # 全局样式（Tailwind 入口）
│   │
│   ├── (auth)/                     # 认证路由组（独立布局，不含侧边栏）
│   │   ├── layout.tsx              # 认证布局：居中卡片 + 背景图 + Logo
│   │   ├── login/page.tsx          # 登录页（SSO + 账密两种方式）
│   │   ├── signup/page.tsx         # 注册页
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   └── (dashboard)/                # 受保护的业务路由组
│       ├── layout.tsx              # Dashboard 布局：侧边栏 + 顶栏 + 权限守卫
│       ├── home/page.tsx           # 首页/欢迎页
│       ├── dashboard/page.tsx      # 数据分析页
│       ├── projects/page.tsx       # 项目列表
│       └── configuration/          # 系统配置（仅管理员可见）
│           ├── page.tsx            # 自动跳转到 /users
│           ├── users/page.tsx      # 用户管理 CRUD
│           ├── profile/page.tsx    # 个人资料 & 修改密码
│           ├── role/page.tsx       # 角色管理 CRUD + 权限树
│           ├── permission/page.tsx # 权限管理
│           ├── menu/page.tsx       # 菜单管理
│           └── projects/page.tsx   # 项目配置
│
├── lib/
│   └── access.ts                   # 权限计算工具函数
│
├── constants/
│   └── menus.ts                    # 菜单定义 + 角色访问控制映射
│
├── public/
│   └── img/                        # 静态图片（logo、背景）
│
├── .env.local                      # 本地私密变量（git-ignored）
├── .env.development                # 开发环境变量
├── .env.production                 # 生产环境变量
├── next.config.ts                  # Next.js 配置（静态导出）
├── tsconfig.json                   # TypeScript 配置
├── postcss.config.mjs              # PostCSS + Tailwind
└── package.json
```

---

## 快速启动

```bash
# 1. 克隆项目
git clone <repo-url>
cd my-app-next-01

# 2. 安装依赖
npm install

# 3. 配置环境变量（复制模板后修改）
cp .env.development .env.local
# 编辑 .env.local，填写本地 API 地址

# 4. 启动开发服务器
npm run dev
# 访问 http://localhost:3000

# 5. 构建生产包（静态导出）
npm run build
# 输出到 /out/ 目录
```

---

## 环境变量

### 变量说明

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `NEXT_PUBLIC_API_URL` | 后端 API 基础地址（前端可访问） | `http://localhost:5000` |
| `NEXT_PUBLIC_ENV_LABEL` | 环境标识，用于 UI 显示和开发模式判断 | `DEVELOPMENT` / `PRODUCTION` |
| `NEXT_PUBLIC_BYPASS_ACCESS` | 开发模式下跳过权限检查 | `true` / `false` |

### .env.development
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_ENV_LABEL=DEVELOPMENT
NEXT_PUBLIC_BYPASS_ACCESS=true
```

### .env.production
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com
NEXT_PUBLIC_ENV_LABEL=PRODUCTION
NEXT_PUBLIC_BYPASS_ACCESS=false
```

> ⚠️ `.env.local` 中的变量优先级最高，用于覆盖团队共享配置，不提交到 git。

---

## 路由与布局设计

### 路由分组策略

使用 Next.js App Router 的**路由分组**（括号目录）实现不同布局共存：

```
app/
├── (auth)/          → 无侧边栏，用于登录/注册等公开页面
│   └── layout.tsx   → 居中白色卡片布局
└── (dashboard)/     → 有侧边栏，用于业务功能页面
    └── layout.tsx   → 左侧导航 + 顶部用户栏布局
```

### 认证路由守卫

`(dashboard)/layout.tsx` 在每次路由加载时检查：

```typescript
// 检查 token 是否存在
const token = localStorage.getItem('token');
if (!token) {
  router.replace('/login');
  return;
}

// 检查 token 是否过期
const payload = JSON.parse(atob(token.split('.')[1]));
if (payload.exp && Date.now() / 1000 > payload.exp) {
  localStorage.clear();
  router.replace('/login');
}
```

### 菜单定义（constants/menus.ts）

```typescript
export const MENUS = [
  {
    name: 'Home',
    path: '/home',
    access: 'isUser',       // 所有登录用户可见
    icon: HomeIcon,
  },
  {
    name: 'Configuration',
    path: '/configuration',
    access: 'isAdmin',      // 仅管理员可见
    icon: SettingsIcon,
    routes: [
      { name: 'Users',      path: '/configuration/users' },
      { name: 'Roles',      path: '/configuration/role' },
      { name: 'Permissions',path: '/configuration/permission' },
    ],
  },
];
```

---

## 认证与鉴权体系

### 整体认证架构

```
用户 → 选择登录方式
        ├── Azure SSO 登录
        │   └── 跳转 UC Portal（uc.crownbio.com）→ Azure AD 验证
        │       └── 设置 HTTP-only Cookie → 重定向回 /login
        │           └── 前端自动 SSO Exchange → 获取 JWT
        │
        └── 账密登录
            └── POST /api/Account/login → 获取 JWT
                
JWT 解码 → 提取 UserRole + UserName → 存入 localStorage
          
后续请求 → Authorization: Bearer <token>
```

### SSO 自动交换（login/page.tsx）

```typescript
async function checkSsoLogin() {
  try {
    const res = await fetch(`${API_BASE}/api/Account/sso-exchange`, {
      method: 'POST',
      credentials: 'include',  // 携带跨域 Cookie
    });
    if (res.ok) {
      const data = await res.json();
      storeTokenAndRedirect(data.token);
    }
  } catch {
    // SSO 失败，显示登录表单
  }
}
```

### JWT 解码与 Roles 提取

```typescript
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  UserRole?: string | string[];
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string | string[];
  UserName?: string;
  exp?: number;
}

const payload = jwtDecode<JwtPayload>(token);

// 提取角色（兼容自定义 claim 和 Azure 标准 claim）
const roleClaim =
  payload['UserRole'] ||
  payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

const userRoles: string[] = Array.isArray(roleClaim)
  ? roleClaim
  : roleClaim
  ? [roleClaim]
  : [];

localStorage.setItem('userRoles', JSON.stringify(userRoles));
localStorage.setItem('userName', payload.UserName ?? '');
```

### 登出流程

```typescript
async function handleLogout() {
  await fetch(`${API_BASE}/api/Account/logout`, {
    method: 'POST',
    credentials: 'include',  // 清除服务端 Cookie
  });
  localStorage.clear();
  sessionStorage.clear();
  router.replace('/login?loggedOut=true');
  // ?loggedOut=true 参数阻止 SSO 自动重新登录
}
```

### Azure SSO 外部链接格式

```typescript
const SSO_URL =
  `https://uc.crownbio.com/sysuser/loginazure` +
  `?r=${CALLBACK_HOST}/login&s=1&l=en`;
```

---

## 角色与权限控制

### 权限计算（lib/access.ts）

```typescript
export function getAccess(userRoles: string[]) {
  const isDevBypass =
    process.env.NEXT_PUBLIC_BYPASS_ACCESS === 'true' ||
    process.env.NEXT_PUBLIC_ENV_LABEL === 'DEVELOPMENT' ||
    process.env.NODE_ENV === 'development';

  return {
    isAdmin:
      isDevBypass ||
      userRoles.includes('admin') ||
      userRoles.includes('superadmin'),
    isUser: isDevBypass || userRoles.length > 0,
  };
}
```

### 在 Dashboard 布局中使用

```typescript
const userRoles: string[] = JSON.parse(
  localStorage.getItem('userRoles') ?? '[]'
);
const access = getAccess(userRoles);

// 过滤菜单
const visibleMenus = MENUS.filter(
  (menu) => access[menu.access as keyof typeof access]
);
```

### 扩展权限类型

在 `lib/access.ts` 中添加新的权限标志：

```typescript
return {
  isAdmin: ...,
  isUser: ...,
  isManager: isDevBypass || userRoles.includes('manager'),  // 新增
};
```

在 `constants/menus.ts` 中使用：

```typescript
{ name: 'Reports', path: '/reports', access: 'isManager' }
```

---

## API 对接规范

### 后端接口约定

所有 API 调用使用 `NEXT_PUBLIC_API_URL` 作为 Base URL：

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

const res = await fetch(`${API_BASE}/api/SomeModule/action`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
  body: JSON.stringify(payload),
});
```

### 标准后端接口列表

#### 账户/认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/Account/login` | 账密登录，返回 JWT |
| POST | `/api/Account/sso-exchange` | SSO Cookie 换 JWT |
| POST | `/api/Account/logout` | 登出，清除服务端 Cookie |
| POST | `/api/Account/logon` | 用户注册 |
| GET  | `/api/Account/profile` | 获取当前用户信息 |
| PUT  | `/api/Account/info` | 更新用户名/手机 |
| PUT  | `/api/Account/password` | 修改密码 |
| PUT  | `/api/Account/phone` | 仅更新手机号 |
| PUT  | `/api/Account/enabled` | 启用/禁用用户 |
| POST | `/api/Account/send-mail-forgot-password` | 发送重置密码邮件 |
| POST | `/api/Account/search` | 搜索用户（分页） |

#### 角色管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET    | `/api/Role` | 角色列表（分页、搜索） |
| POST   | `/api/Role` | 创建/更新角色 |
| DELETE | `/api/Role/{id}` | 删除角色 |
| GET    | `/api/Role/role-actions?roleId=` | 获取角色已绑定权限 |
| POST   | `/api/Role/actions-mapping` | 保存角色权限映射 |

#### 菜单/权限

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/Menu/parents` | 获取根级菜单 |
| GET | `/api/Menu/sub/{menuId}` | 懒加载子菜单 |

### 401 处理模式

```typescript
if (res.status === 401) {
  localStorage.removeItem('token');
  router.replace('/login');
  return;
}
```

### 分页请求格式（POST body）

```typescript
{
  pageIndex: 1,      // 从 1 开始
  pageSize: 25,
  UserName: '',      // 搜索参数（PascalCase，匹配 C# 后端）
  Eid: '',
}
```

---

## 组件与页面约定

### 表单处理（react-hook-form）

```typescript
import { useForm } from 'react-hook-form';

const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

const onSubmit = async (data: FormData) => {
  const res = await fetch(`${API_BASE}/api/...`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  // 处理响应...
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input {...register('fieldName', { required: true })} />
    {errors.fieldName && <span>必填项</span>}
    <button type="submit">提交</button>
  </form>
);
```

### 加载状态约定

```typescript
const [loading, setLoading] = useState(false);

async function fetchData() {
  setLoading(true);
  try {
    const res = await fetch(...);
    // 处理数据
  } finally {
    setLoading(false);
  }
}

// UI
{loading ? (
  <div>Loading...</div>
) : (
  <DataTable data={data} />
)}
```

### Tailwind CSS v4 使用

```css
/* globals.css */
@import "tailwindcss";

/* 自定义变量 */
:root {
  --primary: #your-color;
}
```

> Tailwind v4 使用 `@import "tailwindcss"` 而非旧版 `@tailwind base/components/utilities`

### 图标使用（lucide-react）

```typescript
import { Home, Settings, Users, LogOut } from 'lucide-react';

<Home className="w-5 h-5" />
```

---

## 构建与部署

### 静态导出配置（next.config.ts）

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',          // 生成静态文件到 /out/
  images: {
    unoptimized: true,       // 静态导出不支持 Next.js 图片优化
  },
};

export default nextConfig;
```

### 构建产物

```bash
npm run build
# 生成 /out/ 目录，包含所有静态 HTML/CSS/JS 文件
```

### Nginx 部署示例

```nginx
server {
    listen 80;
    root /var/www/my-app/out;
    index index.html;

    # API 反向代理
    location /api/ {
        proxy_pass http://backend-server:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA 路由支持（静态导出需要）
    location / {
        try_files $uri $uri/ $uri.html /index.html;
    }
}
```

### 重要注意事项

- 静态导出 **不支持** Next.js 内置 API Routes（`app/api/`）
- 所有 API 调用均指向外部后端（`NEXT_PUBLIC_API_URL`）
- 需要 Nginx 做 `/api/*` 的反向代理转发
- 跨域请求需在后端配置 CORS，前端携带 `credentials: 'include'` 时需设置 `Access-Control-Allow-Credentials: true`

---

## 复用该模板的步骤

### 1. 初始化新项目

```bash
# 方案A：直接复制本项目
cp -r my-app-next-01 my-new-app
cd my-new-app
rm -rf .git
git init

# 方案B：使用 create-next-app 重建（确保版本一致）
npx create-next-app@16 my-new-app --typescript --tailwind --app
```

### 2. 替换品牌资产

- `public/img/` 下替换 Logo 和背景图
- 搜索并替换 `BioPortal`（应用名称）
- 更新 `app/layout.tsx` 中的 `<title>` 和 metadata

### 3. 修改环境变量

```bash
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:<新后端端口>
NEXT_PUBLIC_ENV_LABEL=DEVELOPMENT
NEXT_PUBLIC_BYPASS_ACCESS=true

# .env.production
NEXT_PUBLIC_API_URL=https://<新生产域名>
NEXT_PUBLIC_ENV_LABEL=PRODUCTION
NEXT_PUBLIC_BYPASS_ACCESS=false
```

### 4. 更新 Azure SSO 链接

在 `app/(auth)/login/page.tsx` 中修改：

```typescript
// 将 callback 地址改为新应用的域名
const SSO_URL =
  `https://uc.crownbio.com/sysuser/loginazure` +
  `?r=<新应用域名>/login&s=1&l=en`;
```

### 5. 定制菜单（constants/menus.ts）

按业务需求增删菜单项，设置 `access` 权限级别。

### 6. 增删页面

- 在 `app/(dashboard)/` 下新增页面目录
- 遵循 Next.js App Router 约定（`page.tsx`）
- 在 `constants/menus.ts` 中注册菜单入口

### 7. 扩展角色

如需新增角色类型，在 `lib/access.ts` 中添加权限标志，并在 `constants/menus.ts` 中按需使用。

### 8. 对接后端 API

确保后端实现[上述标准接口](#标准后端接口列表)，或在前端 fetch 调用中修改对应的路径和字段名。

---

## 常见问题

**Q: 开发时登录一直跳转怎么办？**  
A: 确认 `.env.development` 中 `NEXT_PUBLIC_BYPASS_ACCESS=true`，或在后端启动服务。

**Q: SSO 登录后白屏？**  
A: 检查 UC Portal 的 callback redirect 地址是否与当前应用域名一致。

**Q: 静态导出后路由 404？**  
A: Nginx 需配置 `try_files $uri $uri.html /index.html`，参考[部署示例](#nginx-部署示例)。

**Q: API 请求跨域报错？**  
A: 后端需配置 CORS，允许前端域名，并开启 `Access-Control-Allow-Credentials: true`。

**Q: 角色权限在开发环境不生效？**  
A: 开发环境下 `NEXT_PUBLIC_BYPASS_ACCESS=true` 会绕过所有权限检查，这是预期行为。

---

*最后更新：2026-05-27 | 基于项目 my-app-next-01*
