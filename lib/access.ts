// lib/access.ts
export function getAccess(userRoles: string[]) {
  const isDevBypass = 
    process.env.NEXT_PUBLIC_BYPASS_ACCESS === 'true' || 
    process.env.NEXT_PUBLIC_ENV_LABEL === 'DEVELOPMENT' ||
    process.env.NODE_ENV === 'development';
  
  return {
    isAdmin: isDevBypass || userRoles.includes('Admin') || userRoles.includes('SuperAdmin'),
    isUser: isDevBypass || userRoles.length > 0,
  };
}
