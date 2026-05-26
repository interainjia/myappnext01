# SKILL: Next.js 14+ Account & Dashboard System Generator

## 1. 角色定义
你是一个高级全栈开发专家，专注于 Next.js (App Router) 架构、TypeScript 类型安全以及基于 Tailwind CSS 的 UI/UX 设计。你的任务是根据提供的 API 规格书，为 `my-app-next-01` 项目生成高性能、响应式的页面。

## 2. 技术规范 (Constraints)
- **Framework**: Next.js 14/15 (App Router).
- **Styling**: Tailwind CSS (移动优先).
- **Icons**: Lucide-react.
- **Form Handling**: React Hook Form + Zod (校验).
- **Data Fetching**: 封装 `fetch` 或 `axios` 到 `@/lib/api-client`.
- **State**: 使用浏览器的 LocalStorage 存储 JWT (来自 /login)。
- **Charts**: 针对 Dashboard 接口，预留 CanvasXpress 或 Plotly 的集成容器。

## 3. 页面开发技能清单 (Pages)

### A. 认证流 (Auth Group)
1. **Login Page**: 
   - 接口: `POST /api/Account/login` (LoginRequestDto)
   - 功能: 登录成功后存储 Token，跳转至 `/dashboard`。
2. **Sign Up / Create Account**: 
   - 接口: `POST /api/Account/logon` (LogOnVM) 或 `POST /api/Account`
   - 功能: 提供用户注册和新账号创建。
3. **Forgot Password**: 
   - 接口: `POST /api/Account/send-mail-create-account` (发送验证码/链接)
   - 接口: `PUT /api/Account/send-mail-forgot-password` (重置密码)

### B. 应用流 (App Group)
1. **Home Page**: 
   - 展示系统概览，提供进入登录或仪表盘的入口。
2. **Dashboard Page**: 
   - 接口: `GET /api/Account/profile` (获取个人信息)
   - 接口: `POST /api/Dashboard/filters` (加载筛选器)
   - 接口: `POST /api/Dashboard/canvas-xpress/*` (渲染生物信息图表容器)
   - 功能: 侧边栏导航、用户头像展示、多维图表展示（CanvasXpress 兼容）。

## 4. 接口与模型映射 (API Mapping)
- **Base URL**: 按环境变量 `NEXT_PUBLIC_API_URL` 配置。
- **Account**: 必须处理 `AccountVm` 的数据结构。
- **Role/Permissions**: 调用 `GET /api/Role/all` 获取角色并在 UI 中根据 `RoleAction` 控制元素可见性。
- **Project Context**: 调用 `GET /api/Account/projects` 获取用户所属项目上下文。

## 5. 执行指令 (Instructions)
当被要求生成页面时，请遵循：
1. **类型先行**: 首先根据提供的模型名称（如 `LoginRequestDto`, `LogOnVM`）生成 TypeScript Interface。
2. **组件解耦**: 提取 FormInput, Button, Sidebar 等到 `@/components`。
3. **交互逻辑**: 必须包含 Loading 状态处理和错误反馈（Toast）。
4. **可视化集成**: 针对 Dashboard 接口，生成包含 `canvas-xpress` 占位逻辑的代码。

## 6. 核心数据模型参考
[AccountVm, ActionVm, LogOnVM, LoginRequestDto, FilterDataDto, RoleAction]

## 7.项目结构实例
app/
├── (auth)/               <-- 路由分组开始
│   ├── layout.tsx        <-- 只对 auth 页面生效的布局（可选）
│   ├── login/
│   │   └── page.tsx      <-- 访问路径: /login
│   └── signup/
│       └── page.tsx      <-- 访问路径: /signup
├── (dashboard)/          <-- 另一个分组
│   ├── layout.tsx        <-- 包含侧边栏的布局
│   └── page.tsx          <-- 访问路径: /dashboard
└── layout.tsx            <-- 全局根布局

## 8. 交付标准
- 代码必须符合 TypeScript 类型安全。
- UI 必须响应式，适配移动设备。
- 组件必须可重用，遵循 DRY 原则。
- 所有 API 调用必须封装在 `@/lib/api-client` 中，并处理错误和加载状态。