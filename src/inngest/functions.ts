import { inngest } from "./client";
import { NonRetriableError } from "inngest"
// import { Webhook } from "svix"
import { createSupabaseClient } from "@/lib/supabase";
import { User, Organization } from "@/types/database";

// ------------------------------------------------------------
// User Functions
// ------------------------------------------------------------

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
          email: email
        })
        .select()
        .single();
        return {
          success: true,
          message: 'Supabase Step: User Created successfully!'
        };
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
          email: email
        })
        .eq('id', user.id)
        .select()
        .single();
        return {
          success: true,
          message: 'Supabase Step: User Updated successfully!'
        };
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

    if (!user.id) {
      throw new NonRetriableError("No id found")
    }
  
    await step.run("delete-supabase-user", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('users')
        .delete()
        .eq('id', user.id)
        return {
          success: true,
          message: 'Supabase Step: User deleted successfully!'
        };
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


// ------------------------------------------------------------
// Organization Functions
// ------------------------------------------------------------

export const clerkCreateOrganization = inngest.createFunction(
  { id: "create-organization-from-clerk"},
  { event: 'clerk/organization.created'}, async ({ event, step }) => {

    const organization = event.data 

    if (!organization.id) {
      throw new NonRetriableError("No organization id found")
    }
  
    await step.run("create-supabase-organization", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('organizations')
        .insert({
          id: organization.id,
          name: organization.name,
          created_at: new Date(organization.created_at).toISOString(),
          updated_at: new Date(organization.updated_at).toISOString(),
          created_by: organization.created_by,
          private_metadata: organization.private_metadata,
          public_metadata: organization.public_metadata,
          slug: organization.slug,
        })
        .select()
        .single();
        return {
          success: true,
          message: 'Supabase Step: Organization Created successfully!'
        };
      } catch (error) {
        throw new NonRetriableError("Failed to create organization in database: " + error)
      }
    })

    return {
      success: true,
      organization: organization as Organization,
      message: 'Organization created successfully!'
    };
});


export const clerkUpdateOrganization = inngest.createFunction(
  { id: "update-organization-from-clerk"},
  { event: 'clerk/organization.updated'}, async ({ event, step }) => {

    const organization = event.data 

    if (!organization.id) {
      throw new NonRetriableError("No organization id found")
    }
  
    await step.run("update-supabase-organization", async () => {
      try {
        const supabase = await createSupabaseClient();
        await supabase
        .from('organizations')
        .update({
          id: organization.id,
          name: organization.name,
          created_at: new Date(organization.created_at).toISOString(),
          updated_at: new Date(organization.updated_at).toISOString(),
          created_by: organization.created_by,
          private_metadata: organization.private_metadata,
          public_metadata: organization.public_metadata,
          slug: organization.slug,
        })
        .select()
        .single();
        return {
          success: true,
          message: 'Supabase Step: Organization Updated successfully!'
        };
      } catch (error) {
        throw new NonRetriableError("Failed to update organization in database: " + error)
      }
    })

    return {
      success: true,
      organization: organization as Organization,
      message: 'Organization updated successfully!'
    };
});