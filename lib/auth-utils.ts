import { prisma } from "@/lib/prisma";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Route handler için auth client (Server Components için)
export async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

// Request için auth client (API routes için)
export function createAuthClientFromRequest(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set() {}, // API routes'ta set etmiyoruz
        remove() {}, // API routes'ta remove etmiyoruz
      },
    }
  );
}

// Server Component'larda kullanım için
export async function getCurrentUser() {
  try {
    const supabase = await createAuthClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

// API routes'ta kullanım için
export async function getCurrentUserFromRequest(request: NextRequest) {
  try {
    const supabase = createAuthClientFromRequest(request);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user from request:", error);
    return null;
  }
}

// Server Component'larda auth zorunluluğu
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// API routes'ta auth zorunluluğu
export async function requireAuthFromRequest(request: NextRequest) {
  const user = await getCurrentUserFromRequest(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Admin kontrolü - Server Components
export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return user;
}

// Admin kontrolü - API Routes
export async function requireAdminFromRequest(request: NextRequest) {
  const user = await requireAuthFromRequest(request);
  if (user.role !== "ADMIN") {
    throw new Error("Admin access required");
  }
  return user;
}

// Senin mevcut fonksiyonların - bunları olduğu gibi bırakıyorum
export async function isUsernameAvailable(
  username: string,
  excludeUserId?: string
): Promise<boolean> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existingUser) return true;
    if (excludeUserId && existingUser.id === excludeUserId) return true;

    return false;
  } catch (error) {
    console.error("Error checking username availability:", error);
    return false;
  }
}

export async function isEmailAvailable(
  email: string,
  excludeUserId?: string
): Promise<boolean> {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!existingUser) return true;
    if (excludeUserId && existingUser.id === excludeUserId) return true;

    return false;
  } catch (error) {
    console.error("Error checking email availability:", error);
    return false;
  }
}

export async function syncUserToDatabase(
  supabaseUser: any,
  additionalData: any
) {
  try {
    const user = await prisma.user.upsert({
      where: { id: supabaseUser.id },
      create: {
        id: supabaseUser.id,
        email: supabaseUser.email,
        username: additionalData.username,
        name: additionalData.name,
        surname: additionalData.surname,
        emailVerified: supabaseUser.email_confirmed_at ? true : false,
      },
      update: {
        email: supabaseUser.email,
        emailVerified: supabaseUser.email_confirmed_at ? true : false,
        updatedAt: new Date(),
      },
    });

    return user;
  } catch (error) {
    console.error("Error syncing user to database:", error);
    throw error;
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export async function findUserByEmailOrUsername(emailOrUsername: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrUsername }, { username: emailOrUsername }],
      },
    });

    return user;
  } catch (error) {
    console.error("Error finding user by email or username:", error);
    return null;
  }
}

// Server-side user bilgisi alma (senin mevcut fonksiyonun - getServerUser)
export async function getServerUser() {
  try {
    const supabase = await createAuthClient();
    const {
      data: { user: supabaseUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !supabaseUser) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: supabaseUser.id },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      ...user,
      email: supabaseUser.email || user.email,
      _count: user._count,
    };
  } catch (error) {
    console.error("Error getting server user:", error);
    return null;
  }
}
