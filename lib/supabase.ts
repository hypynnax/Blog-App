import { createClient } from "@supabase/supabase-js";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
//const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser client (client components için)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Browser client factory
export const createClientComponentClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey);

// Server client (server components için) - cookies parametre olarak alır
export const createServerComponentClient = (cookieStore: any) => {
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
    },
  });
};

// Server client for API routes
export const createRouteHandlerClient = (cookieStore: any) =>
  createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });

//// Admin client (service role key ile)
//export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
//  auth: {
//    autoRefreshToken: false,
//    persistSession: false,
//  },
//});
