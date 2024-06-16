import { renderToStringAsync } from "npm:preact-render-to-string";
import { AtpAgent } from "npm:@atproto/api";

// page imports
import { Actor } from "./pages/mod.ts";

export const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

Deno.serve({
  port: 8080,
}, async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // handle trailing slashes
  if (path !== "/" && url.pathname.match(/\/+$/)) {
    return Response.redirect(
      `${url.protocol}${url.host}${url.pathname.replace(/\/+$/, "")}`,
    );
  }

  // paths
  if (path === "/") {
    const htmlsky = await agent.api.app.bsky.actor.getProfile({
      actor: "htmlsky.app",
    }).then((res) => res.data);

    return new Response(
      await renderToStringAsync(await Actor(htmlsky)),
      headers,
    );
  }

  const profilePattern = new URLPattern({ pathname: "/profile/:actor" });
  if (profilePattern.test(url)) {
    const actorName = profilePattern.exec(url)?.pathname.groups.actor;

    try {
      const actor = await agent.api.app.bsky.actor.getProfile({
        actor: actorName!,
      }).then((res) => res.data);

      return new Response(
        await renderToStringAsync(await Actor(actor)),
        headers,
      );
    } catch (e) {
      // TODO: add error page
      return new Response(e.message, headers);
    }
  }

  return Response.redirect(`${url.protocol}${url.host}`, 303);
});

const headers: ResponseInit = {
  "headers": {
    "Content-Type": "text/html;charset=utf-8",
  },
};
