import { AtpAgent } from "npm:@atproto/api";
import { serveDir } from "jsr:@std/http/file-server";

import Actor from "./actor.ts";

export const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path.startsWith("/static")) {
    return serveDir(req, { quiet: true });
  }

  // handle trailing slashes
  if (path.at(-1) !== "/") {
    return Response.redirect(
      `${url.protocol}${url.host}${url.pathname}/`,
    );
  }

  try {
    // PROFILE
    const profilePattern = new URLPattern({ pathname: "/profile/:actor/" });
    if (profilePattern.test(url)) {
      const actorName = profilePattern.exec(url)?.pathname.groups.actor;
      const actor = new Actor(actorName);

      return new Response(await actor.HTML(), html_headers);
    }

    // RAW PROFILE
    const rawProfilePattern = new URLPattern({ pathname: "/raw/profile/:actor/" });
    if (rawProfilePattern.test(url)) {
      const actorName = rawProfilePattern.exec(url)?.pathname.groups.actor;
      const actor = new Actor(actorName);

      return new Response(await actor.Raw(), json_headers);
    }
  } catch (error) {
    return new Response(
      `<head><meta name="color-scheme" content="light dark"></head>\n${error}`,
      headers,
    );
  }

  return Response.redirect(
    `${url.protocol}${url.host}/profile/htmlsky.app/`,
    303,
  );
});

const html_headers: ResponseInit = {
  "headers": {
    "Content-Type": "text/html;charset=utf-8",
  },
};
const json_headers: ResponseInit = {
  "headers": {
    "Content-Type": "application/json;charset=utf-8",
  },
};
