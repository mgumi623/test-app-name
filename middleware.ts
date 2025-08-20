import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // セッションを更新
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 保護されたルートのパターン
  const protectedRoutes = ['/Select', '/schedule', '/corporate', '/AIchat'];
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // ログインページへのアクセスでセッションがある場合は/Selectへリダイレクト
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/Select', request.url));
  }

  // 保護されたルートへのアクセスでセッションがない場合は/loginへリダイレクト
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|image).*)'],
};