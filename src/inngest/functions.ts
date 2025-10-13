import { inngest } from "./client";
import { NonRetriableError } from "inngest"
// import { Webhook } from "svix"
import { createSupabaseClient } from "@/lib/supabase";
// import { createUser, updateUser, deleteUser } from "@/lib/actions/user.actions";
import { User } from "@/types/database";

export const clerkCreateUser = inngest.createFunction(
  { id: "create-user-from-clerk"},
  { event: 'clerk/user.created'}, async ({ event, step }) => {

    /*await step.run("verify-webhook", async () => {
        try {
          verifyWebHook(event.data)
        } catch (error) {
          throw new NonRetriableError("invalid webhook"+error)
        }
    })*/
   
    const user = event.data 
    const email = user.email_addresses.find((e: { id: string; email_address: string }) => e.id === user.primary_email_address_id)?.email_address

    if (!user.id || !email) {
      throw new NonRetriableError("No id or primary email address found")
    }
  
    await step.run("create-supabase-user", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('users')
        .insert({
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: email,
        })
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

    const user = event.data 
    const email = user.email_addresses.find((e: { id: string; email_address: string }) => e.id === user.primary_email_address_id)?.email_address

    if (!user.id || !email) {
      throw new NonRetriableError("No id or primary email address found")
    }
  
    await step.run("update-supabase-user", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('users')
        .update({
          first_name: user.first_name,
          last_name: user.last_name,
          email: email,
        })
        .eq('id', user.id)
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

    const user = event.data 
    const email = user.email_addresses.find((e: { id: string; email_address: string }) => e.id === user.primary_email_address_id)?.email_address

    if (!user.id || !email) {
      throw new NonRetriableError("No id or primary email address found")
    }
  
    await step.run("delete-supabase-user", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
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