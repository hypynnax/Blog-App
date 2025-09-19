import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes - giriş yapmış kullanıcılar için
  const protectedRoutes = [
    "/dashboard",
    "/yazilarim",
    "/yazi-olustur",
    "/yazi-duzenle",
  ];

  // Auth routes - giriş yapmamış kullanıcılar için
  const authRoutes = ["/giris", "/kayit", "/sifremi-unuttum", "/sifre-sifirla"];

  // API routes that need admin access
  const adminApiRoutes = ["/api/admin"];

  const profil = ["/profil"].includes(req.nextUrl.pathname);

  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  const isAdminApiRoute = adminApiRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  // POST/PUT/DELETE operations on posts and comments need auth
  const needsAuthForWrite =
    (req.nextUrl.pathname.startsWith("/api/posts") ||
      req.nextUrl.pathname.startsWith("/api/comments")) &&
    ["POST", "PUT", "DELETE"].includes(req.method);

  // API routes authentication
  if (isAdminApiRoute || needsAuthForWrite) {
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Admin check for admin routes - database'den role kontrolü gerekebilir
    if (isAdminApiRoute) {
      // Admin role check burada yapılabilir
      // Şimdilik API route'ların içinde kontrol edeceğiz
    }
  }

  // Page routes authentication
  if ((isProtectedRoute || profil) && !session) {
    return NextResponse.redirect(new URL("/giris", req.url));
  }

  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    "/((?!api|_next/static|_next/image|favicon.ico|icons).*)",
    "/api/:path*", // API routes için de çalıştır
  ],
};
