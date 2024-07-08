import { AtpAgent } from "npm:@atproto/api";
import { serveDir, serveFile } from "jsr:@std/http/file-server";

import Actor from "./actor.js";

export const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  const redir = `${url.protocol}${url.host}`;
  const query = new URLSearchParams(url.search);

  // wrangle bots
  if (path === "/robots.txt") {
    return serveFile(req, "./static/robots.txt");
  }

  // serve static files
  if (path.startsWith("/static")) {
    return serveDir(req, { quiet: true });
  }

  // handle trailing slashes
  if (path.at(-1) !== "/") {
    return Response.redirect(
      `${redir}${url.pathname}/`,
    );
  }

  try {
    // PROFILE
    const profilePattern = new URLPattern({ pathname: "/profile/:identifier/:page?/" });
    if (profilePattern.test(url)) {
      const identifier = profilePattern.exec(url)?.pathname.groups.identifier,
      			page = profilePattern.exec(url)?.pathname.groups.page;

      // TODO: move API calls out

      const actor = new Actor(identifier);
      const cursor = query.get("cursor");

      // TODO: move pages here

      if (cursor) return new Response(await actor.HTML(cursor), html_headers);
      else return new Response(await actor.HTML(), html_headers);
    }

    /*
    if (pageProfilePattern.test(url)) {
      const actorName = pageProfilePattern.exec(url)?.pathname.groups.actor;
      const pageName = pageProfilePattern.exec(url)?.pathname.groups.page;
      const actor = new Actor(actorName);

      if (pageName === "followers") {
        const cursor = query.get("cursor");
        if (cursor) {
          return new Response(await actor.Followers(cursor), html_headers);
        } else return new Response(await actor.Followers(), html_headers);
      }
      if (pageName === "follows") {
        const cursor = query.get("cursor");
        if (cursor) {
          return new Response(await actor.Follows(cursor), html_headers);
        } else return new Response(await actor.Follows(), html_headers);
      }
    }
    */
  } catch (error) {
    return new Response(
      `<head><meta name="color-scheme" content="light dark"></head>\n${error}`,
      html_headers,
    );
  }

  return Response.redirect(
    `${url.protocol}${url.host}/profile/htmlsky.app/`,
    303,
  );
});

const html_headers = {
  "headers": {
    "Content-Type": "text/html;charset=utf-8",
  },
};
const json_headers = {
  "headers": {
    "Content-Type": "application/json;charset=utf-8",
  },
};
