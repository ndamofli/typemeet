import { inngest } from "./client";
import { createSupabaseClient } from "@/lib/supabase";
import type { UserJSON } from '@clerk/backend'
//import { createReadStream } from "fs";
//import { unlink } from "fs/promises";
//import { openai } from "@/lib/openai";
//import { createSupabaseClient } from "@/lib/supabase";

export const syncUser = async (event: { data: UserJSON }) => {
  const clerkUserJson = event.data
  const { id, first_name, last_name } = clerkUserJson
  
  const email = clerkUserJson.email_addresses.find(
    (e) => e.id === clerkUserJson.primary_email_address_id,
  )!.email_address
  const supabase = await createSupabaseClient()
  return await supabase.from('users').insert({ clerk_id:id, email:email, first_name:first_name, last_name:last_name })
}

export const syncCreatedUser = inngest.createFunction(
  { id: 'sync-created-user-from-clerk' },
  { event: 'clerk/user.created' },
  async ({ event }) => {
    return await syncUser(event as { data: UserJSON })
  },
)

export const syncUpdatedUser = inngest.createFunction(
  { id: 'sync-updated-user-from-clerk' },
  { event: 'clerk/user.updated' },
  async ({ event }) => {
    return await syncUser(event as { data: UserJSON })
  },
)