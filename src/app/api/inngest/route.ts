import { inngest } from "@/inngest/client";
import { serve } from "inngest/next";
import { syncCreatedUser, syncUpdatedUser } from "@/inngest/functions"; // Your own functions

// All serve handlers have the same arguments:
serve({
  client: inngest, // a client created with new Inngest()
  functions: [syncCreatedUser, syncUpdatedUser], // an array of Inngest functions to serve, created with inngest.createFunction()
  /* Optional extra configuration */
});