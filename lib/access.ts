// lib/access.ts
export function getAccess(userRoles: string[]) {
  const isDevBypass = 
    process.env.NEXT_PUBLIC_BYPASS_ACCESS === 'true' || 
    process.env.NEXT_PUBLIC_ENV_LABEL === 'DEVELOPMENT' ||
    process.env.NODE_ENV === 'development';
  
  const normalizedRoles = userRoles.map(r => r.toLowerCase());
  
  return {
    isAdmin: isDevBypass || normalizedRoles.includes('admin') || normalizedRoles.includes('superadmin'),
    isUser: isDevBypass || userRoles.length > 0,
  };
}
