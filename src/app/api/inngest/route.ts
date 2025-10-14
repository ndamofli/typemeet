import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";
import { clerkCreateUser, clerkUpdateUser, clerkDeleteUser, clerkCreateOrganization, clerkUpdateOrganization } from "@/inngest/functions"; // Your own functions

// clerkDeleteOrganization is not used > ON DELETE CASCADE > When deleting user , organization will be deleted automatically -- created_by text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [clerkCreateUser, clerkUpdateUser, clerkDeleteUser, clerkCreateOrganization, clerkUpdateOrganization], // an array of Inngest functions to serve, created with inngest.createFunction()
  /* Optional extra configuration */
});