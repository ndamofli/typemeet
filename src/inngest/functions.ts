import { inngest } from "./client";
import { NonRetriableError } from "inngest"
import { Webhook } from "svix"
import { createSupabaseClient } from "@/lib/supabase";
// import { createUser, updateUser, deleteUser } from "@/lib/actions/user.actions";
import { User } from "@/types/database";

function verifyWebHook({ headers, raw }: { raw: string, headers: Record<string, string> }) {
  return new Webhook(process.env.CLERK_WEBHOOK_SECRET!).verify(raw, headers);
}

export const clerkCreateUser = inngest.createFunction(
  { id: "create-user-from-clerk"},
  { event: 'clerk/user.created'}, async ({ event, step }) => {

    await step.run("verify-webhook", async () => {
        try {
          verifyWebHook(event.data)
        } catch (error) {
          throw new NonRetriableError("invalid webhook: " + error)
        }
    })

    const user = event.data 
    const email = user.email_addresses.find((e: { id: string; email_address: string }) => e.id === user.primary_email_address_id)?.email_address

    if (!user.clerk_id || !email) {
      throw new NonRetriableError("No clerk_id or primary email address found")
    }
  
    await step.run("create-supabase-user", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('users')
        .insert(user)
        .select()
        .single();       
      } catch (error) {
        throw new NonRetriableError("Failed to create user in database: " + error)
      }
    })

    return {
      success: true,
      user: user as User,
      message: 'User created successfully!'
    };
});

export const clerkUpdateUser = inngest.createFunction(
  { id: "update-user-from-clerk"},
  { event: 'clerk/user.updated'}, async ({ event, step }) => {

    await step.run("verify-webhook", async () => {
        try {
          verifyWebHook(event.data)
        } catch (error) {
          throw new NonRetriableError("invalid webhook: " + error)
        }
    })

    const user = event.data 
    const email = user.email_addresses.find((e: { id: string; email_address: string }) => e.id === user.primary_email_address_id)?.email_address

    if (!user.clerk_id || !email) {
      throw new NonRetriableError("No clerk_id or primary email address found")
    }
  
    await step.run("update-supabase-user", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('users')
        .update(user)
        .eq('clerk_id', user.clerk_id)
        .select()
        .single();       
      } catch (error) {
        throw new NonRetriableError("Failed to update user in database: " + error)
      }
    })

    return {
      success: true,
      user: user as User,
      message: 'User updated successfully!'
    };
});

export const clerkDeleteUser = inngest.createFunction(
  { id: "delete-user-from-clerk"},
  { event: 'clerk/user.deleted'}, async ({ event, step }) => {

    await step.run("verify-webhook", async () => {
        try {
          verifyWebHook(event.data)
        } catch (error) {
          throw new NonRetriableError("invalid webhook"+error)
        }
    })

    const user = event.data 
    const email = user.email_addresses.find((e: { id: string; email_address: string }) => e.id === user.primary_email_address_id)?.email_address

    if (!user.clerk_id || !email) {
      throw new NonRetriableError("No clerk_id or primary email address found")
    }
  
    await step.run("delete-supabase-user", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('users')
        .delete()
        .eq('clerk_id', user.clerk_id)
      } catch (error) {
        throw new NonRetriableError("Failed to delete user in database: " + error)
      }
    })

    return {
      success: true,
      user: user as User,
      message: 'User deleted successfully!'
    };
});