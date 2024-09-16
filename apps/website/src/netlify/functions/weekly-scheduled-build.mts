import type { Config } from "@netlify/functions";

// a scheduled function to trigger a build hook once a week.
// a simple way to update instagram feed, google reviews etc.
export default async () => {
  await fetch("https://api.netlify.com/build_hooks/66e7cd2c0165a8c4b69fac25", {
    method: "POST",
  }).then((response) => {
    console.log("Build hook response:", response);
  });

  return { statusCode: 200 };
};

export const config: Config = {
  schedule: "@weekly",
};
