import { AtpAgent } from "npm:@atproto/api";
import { serveDir, serveFile } from "jsr:@std/http/file-server";

import Actor from "./actor.js";
import Thread from "./thread.js";

export const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

const controller = new AbortController(), signal = controller.signal;
Deno.serve({ signal }, async (req, info) => {
  const headers = new Headers(req.headers);
  const ua = headers.get("user-agent");
  
  // Bots should receive empty reply
  if (
    ua.includes("amazon") ||
    ua.includes("facebook") ||
    ua.includes("Bytespider") ||
    ua.includes("bot")
  ) {
    controller.abort();
  }

  const url = new URL(req.url);
  const path = url.pathname;
  const redir = `${url.protocol}${url.host}`;
  const query = new URLSearchParams(url.search);

  // wrangle bots
  if (path === "/robots.txt") {
    return serveFile(req, "./static/robots.txt");
  }
  // "serve favicon"
  if (path === "/favicon.ico") {
    return new Response({ status: 404 });
  }
  // serve static files
  if (path.startsWith("/static")) {
    return serveDir(req, { quiet: true });
  }
  // handle trailing slashes
  if (path.at(-1) !== "/") {
    return Response.redirect(`${redir}${url.pathname}/`);
  }

  try {
    
    // PROFILE
    const profilePattern = new URLPattern({
      pathname: "/profile/:identifier/:page?/",
    });
    if (profilePattern.test(url)) {
      const identifier = profilePattern.exec(url)?.pathname.groups.identifier;
      const page = profilePattern.exec(url)?.pathname.groups.page;

      const { data } = await agent.api.app.bsky.actor.getProfile({ actor: identifier });
      const actor = new Actor(data);
      const cursor = query.get("cursor");

      let res = await actor.Profile();
      switch (page) {
	// Empty case is for /profile/
	case "":
	  res += await actor.Feed(cursor);
	  break;
	case "follows":
	  res += await actor.Follows(cursor);
	  break;
	case "followers":
	  res += await actor.Followers(cursor);
	  break;
	default:
	  throw new Error("not a page");
      }
      return new Response(res, html_headers);
    }

    // THREADS
    const postPattern = new URLPattern({
      pathname: "/profile/:identifier/post/:rkey/:page?/",
    });
    if (postPattern.test(url)) {
      const identifier = postPattern.exec(url)?.pathname.groups.identifier;
      const rkey = postPattern.exec(url)?.pathname.groups.rkey;
      const page = postPattern.exec(url)?.pathname.groups.page;

      const { data } = await agent.api.app.bsky.feed.getPostThread({ uri: `at://${identifier}/app.bsky.feed.post/${rkey}` });
      const thread = new Thread(data.thread);
      const cursor = query.get("cursor");

      let res = await thread.Post();
      switch (page) {
	case "":
	  res += await thread.Replies(cursor);
	  break;
	default:
	  throw new Error("not a page");
      }

      return new Response(res, html_headers);
    }

  } catch (error) {
    return new Response(
      `<head><meta name="color-scheme" content="light dark"></head>\n${error}`,
      html_headers,
    );
  }

  return Response.redirect(
    `${url.protocol}${url.host}/profile/did:plc:sxouh4kxso3dufvnafa2zggn`,
    303,
  );
});

const html_headers = {
  headers: {
    "Content-Type": "text/html;charset=utf-8",
  },
};
const json_headers = {
  headers: {
    "Content-Type": "application/json;charset=utf-8",
  },
};

export const DateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "long",
  timeZone: "UTC",
  hour12: false,
});

const RelativeTimeFormat = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});
export function getRelativeDate(date) {
  const ms = date.getTime();
  const deltaSeconds = Math.round((ms - Date.now()) / 1000);
  const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
  const units = ["second", "minute", "hour", "day", "week", "month", "year"];
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
  const divided = deltaSeconds / divisor;
  const value = divided >= 0 ? Math.floor(divided) : Math.ceil(divided);
  return RelativeTimeFormat.format(value, units[unitIndex]);
}
