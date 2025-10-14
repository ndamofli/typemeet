import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";
import { clerkCreateUser, clerkUpdateUser, clerkDeleteUser, clerkCreateOrganization, clerkUpdateOrganization, clerkDeleteOrganization } from "@/inngest/functions"; // Your own functions

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [clerkCreateUser, clerkUpdateUser, clerkDeleteUser, clerkCreateOrganization, clerkUpdateOrganization, clerkDeleteOrganization], // an array of Inngest functions to serve, created with inngest.createFunction()
  /* Optional extra configuration */
});