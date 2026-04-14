import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// This creates a Supabase client that runs on the SERVER.
// Used for secure operations like: checking login status, reading protected data.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // This can be ignored in Server Components where cookies are read-only.
            // The cookies will be set properly by the middleware/proxy instead.
          }
        },
      },
    }
  );
}
