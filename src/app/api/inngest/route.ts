import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";
import { syncCreatedUser, syncUpdatedUser } from "@/inngest/functions"; // Your own functions

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [syncCreatedUser, syncUpdatedUser], // an array of Inngest functions to serve, created with inngest.createFunction()
  /* Optional extra configuration */
});