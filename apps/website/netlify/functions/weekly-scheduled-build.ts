import type { Config } from "@netlify/functions";

// a scheduled function to trigger a build hook once a week.
// a simple way to update instagram feed, google reviews etc.
export default async () => {
  try {
    const response = await fetch(
      "https://api.netlify.com/build_hooks/66e7cd2c0165a8c4b69fac25",
      {
        method: "POST",
      },
    );
    console.log("Build hook response:", response);
    return new Response("ok");
  } catch (err) {
    console.error("Build hook error:", err);
    return Response.error();
  }
};

export const config: Config = {
  schedule: "@weekly",
};
