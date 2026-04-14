import { createBrowserClient } from "@supabase/ssr";

// This creates a Supabase client that runs in the BROWSER.
// Used for things like: showing data on the page, real-time updates.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
