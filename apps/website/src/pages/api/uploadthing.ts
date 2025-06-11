import { createRouteHandler } from "uploadthing/server";
import { ourFileRouter } from "@/server/uploadthing";

export const prerender = false;

// Export routes for Next App Router
const handler = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: import.meta.env.UPLOADTHING_TOKEN,
    logLevel: "Debug",
  },
});

export { handler as GET, handler as POST };
