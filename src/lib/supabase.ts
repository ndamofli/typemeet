import { cookies } from "next/headers";
import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from "@supabase/ssr";

// Server-side client with RLS
export const createSupabaseClient = async () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      async accessToken() {
        return (await auth()).getToken()
      },
    },
  );
};

export const createSupabaseServerClient = async () => {
  const { getToken } = await auth();
  const supabaseAccessToken = await getToken({ template: "supabase" });
  
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // SUPABASE_SERVICE_ROLE_KEY
    {
      global: {
        headers: {
          Authorization: `Bearer ${supabaseAccessToken}`, // 👈 mandas el token de Clerk
        },
      },
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
            // silencioso en RSC
          }
        },
      },
    }
  );
};


// Helper function to get user from Supabase based on clerk_id
export async function getUserFromDB(clerk_id: string) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerk_id)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data
}

// Helper function to create user in Supabase
export async function createUserInDB(clerk_id: string, email: string) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        clerk_id,
        email,
        subscription_tier: 'free',
        subscription_status: 'active',
      },
    ])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating user:', error)
    return null
  }
  
  return data
}
