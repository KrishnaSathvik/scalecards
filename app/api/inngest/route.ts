// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { refreshDatasets } from "@/inngest/functions/refreshDatasets";
import { watchForNewPublications } from "@/inngest/functions/watchForNewPublications";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [refreshDatasets, watchForNewPublications],
});
