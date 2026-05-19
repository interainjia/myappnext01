# 2026.05.13
 新设计的首页采用现代化的仪表盘风格，包含以下核心模块：

   1. 个性化欢迎横幅：从 localStorage 获取用户名并展示，提供快速跳转至 Dashboard 的按钮。
   2. 关键指标卡片 (Stats
      Grid)：展示活跃项目数、待评审项、完成率及下一个里程碑等模拟数据。
   3. 快捷导航 (Quick Navigation)：根据 MENU_ITEMS
      常量配置，提供指向仪表盘、项目列表、系统配置和用户管理的直观入口。
   4. 平台动态 (Platform
      Update)：深色风格的卡片，用于展示系统更新或公告，增强页面的视觉层次感。

  页面特点：
   * 品牌一致性：使用了项目中定义的 #4db694 品牌色及 lucide-react 图标库。
   * 自适应布局：兼容不同屏幕尺寸，在移动端和桌面端均有良好的展示效果。
   * 交互动效：添加了平滑的淡入效果 (animate-in fade-in) 和悬停交互。

  您现在可以启动开发服务器并访问 /home 路径查看效果。
---
---
  # 2026.05.14
  1. 已经修复了菜单图标不显示的问题。

  问题原因
  在 app/(dashboard)/layout.tsx 中，虽然遍历了 MENU_ITEMS
  常量，但代码中只渲染了菜单的名称（{item.name}），并没有将 item.icon 渲染出来。

  修复方案
  在 app/(dashboard)/layout.tsx 的菜单渲染逻辑中，提取了每个菜单项的 icon
  组件，并将其放置在菜单名称之前，设置了合适的尺寸（size={18}）。

  修改的代码片段 (app/(dashboard)/layout.tsx)：

    1 {filteredMenus.map((item) => {
    2   const isActive = pathname.startsWith(item.path);
    3   const hasSubmenu = item.routes && item.routes.length > 0;
    4   const Icon = item.icon; // 提取图标组件
    5
    6   return (
    7     <div key={item.path} className="relative group">
    8       <Link
    9         href={item.path}
   10         className={`px-4 py-2 rounded-md text-sm font-medium transition-all
      duration-200 flex items-center gap-1.5 ${
   11           isActive 
   12             ? 'bg-[#4db694] text-white shadow-sm' 
   13             : 'hover:bg-slate-800 hover:text-white'
   14         }`}
   15       >
   16         <Icon size={18} /> {/* 渲染图标 */}
   17         {item.name}
   18         {/* ... */}
   19       </Link>
   20       {/* ... */}
   21     </div>
   22   );
   23 })}
   
---
  2. 现在，导航栏中的 Home、Dashboard、Configuration 和 Project List 菜单项都将正确显示对应的Lucide 图标。

  已经在 Configuration 菜单下成功添加了您要求的 6 个子菜单，并同步创建了对应的占位页面：

  1. 更新菜单配置 (constants/menus.ts)
  将原有的子菜单替换为：
   * Menu Management (/configuration/menu)
   * Permission Config (/configuration/permission)
   * Role Management (/configuration/role)
   * System Users (/configuration/users)
   * User Projects (/configuration/projects)
   * User Profile (/configuration/profile)

  2. 创建/更新页面组件
  为所有新菜单创建了基础页面结构，并更新了现有页面：
   * 新建了 menu, permission, role, projects, profile 的 page.tsx。
   * 将原 users/page.tsx 的标题更新为 System Users。
   * 移除了不再使用的 system/page.tsx 以保持目录整洁。

  现在您可以刷新页面，在 Configuration
  下拉菜单中查看并点击这些新项。所有的路由都已经打通，不会出现 404 错误。

---
  3. 我已完成对系统的修复与调整。主要改动如下：

   1. 修复报错页面：修复了 app/(dashboard)/layout.tsx 文件中的严重语法错误。该文件之前在
      JSX 中误入了 import 语句及非法字符，导致整个仪表盘区域无法正常渲染。
   2. 移动 Profile 菜单：
       * 已将 "Profile" 链接从侧边栏的 "Configuration" 菜单中移除（通过验证
         constants/menus.ts 确保其不在菜单配置中）。
       * 在顶部导航栏右上角的用户信息下拉菜单中集成了 "Profile"
         入口，并配备了对应的用户图标。
   3. 完善布局：修正了 layout.tsx 的导入逻辑，确保 lucide-react 的 User 图标（作为
      UserIcon）能够正确加载。

  现在，您可以通过点击（或悬停）页面右上角的用户名，在弹出的下拉菜单中找到并进入 Profile
  页面。之前的报错页面也已恢复正常。


  4.我已将左上角的公司 Logo 调大。

  具体改动如下：
   - 尺寸调整：将原始的 128x32 像素增加到了 160x40 像素。
   - 样式优化：同时同步更新了 CSS 高度类（从 h-8 改为 h-10），确保 Logo
     在导航栏中更加显眼且比例协调。

  现在 Logo 看起来会比之前更加醒目。
---
---
#  2026.05.15
  1. 已经在 app/(dashboard)/layout.tsx 中实现了 Token 过期检查逻辑。该逻辑会应用于 Dashboard、Project List 和
  Configuration 中的所有页面，但会自动跳过 Home 页面（路径为 /home）。

  实现细节：
   1. 自动检测：在页面加载或路由切换时，系统会自动检查 localStorage 中的 token。
   2. JWT 解析：如果 token 是标准的 JWT 格式，它会解析其中的 exp（过期时间）字段进行校验。
   3. 过期提醒：一旦发现 Token 缺失或已过期，会弹出英文提示框：
      > "Your login information has expired, please log in again."
   4. 自动跳转：用户点击弹窗中的 "OK" 后，系统会清空本地缓存并跳转至 /login 登录页面。
   5. 白名单机制：通过 pathname === '/home' 逻辑，确保主页不会触发此过期检查。

  你可以通过手动删除浏览器的 localStorage 中的 token 或等待 Token 自然过期来测试此功能。

---
  2. 已经在 app/(dashboard)/layout.tsx 中实现了 Token 过期检查逻辑。该逻辑会应用于 Dashboard、Project List 和
  Configuration 中的所有页面，但会自动跳过 Home 页面（路径为 /home）。

  实现细节：
   1. 自动检测：在页面加载或路由切换时，系统会自动检查 localStorage 中的 token。
   2. JWT 解析：如果 token 是标准的 JWT 格式，它会解析其中的 exp（过期时间）字段进行校验。
   3. 过期提醒：一旦发现 Token 缺失或已过期，会弹出英文提示框：
      > "Your login information has expired, please log in again."
   4. 自动跳转：用户点击弹窗中的 "OK" 后，系统会清空本地缓存并跳转至 /login 登录页面。
   5. 白名单机制：通过 pathname === '/home' 逻辑，确保主页不会触发此过期检查。

  你可以通过手动删除浏览器的 localStorage 中的 token 或等待 Token 自然过期来测试此功能。

  ---
  ---
  # 2026.05.19
  1. 已将 app/(dashboard)/configuration/menu/page.tsx 的内容复制到
  app/(dashboard)/configuration/permission/page.tsx 中。

  主要改动如下：
   1. API 路径更新：将 fetch 请求中的 /api/Menu/all-actions 修改为 /api/Menu/parents。
   2. 组件重命名：将导出的组件名从 MenuManagementPage 修改为 PermissionManagementPage。
   3. UI 文本更新：将页面标题和表格标题中的 "Menu" 改为 "Permission"，使其更符合权限管理页面的语境。

   4. 外层 div：改成了 <div className="flex justify-end items-center gap-2">，去掉了依赖父级 hover 才显示的逻辑。

   Edit 按钮：使用了 bg-blue-400 text-white shadow-sm，鼠标悬浮时颜色加深为 hover:bg-blue-500。

   Delete 按钮：使用了 bg-red-400 text-white shadow-sm，鼠标悬浮时颜色加深为 hover:bg-red-500。

   Tooltip：顺手加上了 title="Edit" 和 title="Delete"，这样鼠标放上去会有原生的文字提示，体验更好。

--
   2. 已修复 role/page.tsx 中点击 "Add Role" 和 "Edit Role" 按钮可能导致的报错问题。

  主要修复内容：
   1. API 响应安全性增强：为所有 fetch 请求添加了类型校验，确保返回的数据在调用 .map() 或 new Set()
      之前确实是数组格式，防止因后端返回错误对象而导致的前端崩溃。
   2. ID 比较兼容性：在 find 查找目标角色时，将 ID 统一转换为字符串进行比较 (String(r.tid) ===
      String(selectedRoleId))，以处理 API 返回的 ID 类型（数字或字符串）不一致的问题。
   3. 表单值空值处理：确保 formData 中的 description 等字段在为 null 时回退为空字符串 ''，避免 React
      受控组件因接收到 null 而报错。
   4. 加载状态闭环：在 handleOpenModal 中增加了错误分支的 setTreeLoading(false)
      调用，确保即使发生错误，界面也不会卡在加载动画中。
   5. 权限树组件健壮性：增强了递归树组件对子节点的校验。