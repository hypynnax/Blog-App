"use client";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  ReactNode,
} from "react";
import { createClientComponentClient } from "@/lib/supabase";
import {
  AuthUser,
  SignUpData,
  SignInData,
  ResetPasswordData,
} from "@/types/auth";
import { useRouter } from "next/navigation";

// Remember Me cookie utilities
const REMEMBER_ME_KEY = "blog_remember_me";
const REMEMBER_TOKEN_KEY = "blog_remember_token";

const rememberMeUtils = {
  setRememberMe: (rememberMe: boolean, userToken?: string) => {
    if (typeof window === "undefined") return;

    if (rememberMe && userToken) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      document.cookie = `${REMEMBER_ME_KEY}=true; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
      document.cookie = `${REMEMBER_TOKEN_KEY}=${userToken}; expires=${expiryDate.toUTCString()}; path=/; secure; samesite=strict`;
    } else {
      document.cookie = `${REMEMBER_ME_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      document.cookie = `${REMEMBER_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    }
  },

  getRememberMe: (): { rememberMe: boolean; token: string | null } => {
    if (typeof window === "undefined")
      return { rememberMe: false, token: null };

    const rememberMe =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${REMEMBER_ME_KEY}=`))
        ?.split("=")[1] === "true";

    const token =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${REMEMBER_TOKEN_KEY}=`))
        ?.split("=")[1] || null;

    return { rememberMe, token };
  },

  clearRememberMe: () => {
    if (typeof window === "undefined") return;

    document.cookie = `${REMEMBER_ME_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    document.cookie = `${REMEMBER_TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
  },
};

const generateRememberToken = (userId: string, email: string): string => {
  const data = `${userId}-${email}-${Date.now()}`;
  return btoa(data)
    .replace(/[^a-zA-Z0-9]/g, "")
    .substring(0, 32);
};

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (
    data: SignUpData
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  signIn: (
    data: SignInData,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (
    data: ResetPasswordData
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  updatePassword: (
    password: string
  ) => Promise<{ success: boolean; message?: string; error?: string }>;
  refreshUser: () => Promise<void>;
  checkRememberedUser: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Initial check - önce remember me kontrol et, sonra user fetch et
    initializeAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await getUser();
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        rememberMeUtils.clearRememberMe();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  async function initializeAuth() {
    try {
      // Önce mevcut session'ı kontrol et
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        // Aktif session var, user bilgisini al
        await getUser();
      } else {
        // Session yok, remember me kontrol et
        const remembered = await checkRememberedUser();
        if (!remembered) {
          setLoading(false);
        }
      }
    } catch (error) {
      setLoading(false);
    }
  }

  async function getUser() {
    try {
      const response = await fetch("/api/auth/user");
      if (response.ok) {
        const { data } = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const checkRememberedUser = async (): Promise<boolean> => {
    try {
      const { rememberMe, token } = rememberMeUtils.getRememberMe();

      if (!rememberMe || !token) {
        return false;
      }

      // Remember token'ı API'ye gönder ve session oluşturmaya çalış
      const response = await fetch("/api/auth/check-remember-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success && result.data?.user) {
        setUser(result.data.user);
        return true;
      } else {
        // Geçersiz token, temizle
        rememberMeUtils.clearRememberMe();
        return false;
      }
    } catch (error) {
      rememberMeUtils.clearRememberMe();
      return false;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, error: "Kayıt sırasında bir hata oluştu" };
    }
  };

  const signIn = async (data: SignInData, rememberMe: boolean = false) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        await getUser();

        // Remember me aktifse token oluştur ve kaydet
        if (rememberMe && result.data?.user) {
          const rememberToken = generateRememberToken(
            result.data.user.id,
            result.data.user.email
          );

          // Token'ı database'e kaydet
          await fetch("/api/auth/save-remember-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: result.data.user.id,
              token: rememberToken,
            }),
          });

          // Cookie'ye kaydet
          rememberMeUtils.setRememberMe(true, rememberToken);
        }

        router.push("/dashboard");
      }

      return result;
    } catch (error) {
      return { success: false, error: "Giriş sırasında bir hata oluştu" };
    }
  };

  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });

      // Remember token'ı database'den sil
      const { token } = rememberMeUtils.getRememberMe();
      if (token) {
        await fetch("/api/auth/remove-remember-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
      }

      rememberMeUtils.clearRememberMe();
      setUser(null);
      router.push("/auth/signin");
    } catch (error) {}
  };

  const resetPassword = async (data: ResetPasswordData) => {
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Şifre sıfırlama sırasında bir hata oluştu",
      };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const response = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        success: false,
        error: "Şifre güncelleme sırasında bir hata oluştu",
      };
    }
  };

  const refreshUser = async () => {
    await getUser();
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    refreshUser,
    checkRememberedUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
