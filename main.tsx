import { renderToStringAsync } from "npm:preact-render-to-string";
import { AtpAgent } from "npm:@atproto/api";

// page imports
import * as pages from "./pages/mod.ts";

export const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

Deno.serve({
  port: 8080,
}, async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // handle trailing slashes
  if (path.at(-1) !== "/") {
    return Response.redirect(
      `${url.protocol}${url.host}${url.pathname}/`,
    );
  }

  const profilePattern = new URLPattern({ pathname: "/profile/:actor/" });
  if (profilePattern.test(url)) {
    const actorName = profilePattern.exec(url)?.pathname.groups.actor;

    try {
      const actor = await agent.api.app.bsky.actor.getProfile({
        actor: actorName!,
      }).then((res) => res.data);

      return new Response(
        await renderToStringAsync(await pages.Actor({ actor: actor })),
        headers,
      );
    } catch (e) {
      // TODO: add error page
      return new Response(e.message, headers);
    }
  }
  const profilePagePattern = new URLPattern({
    pathname: "/profile/:actor/:page/",
  });
  if (profilePagePattern.test(url)) {
    const actorName = profilePagePattern.exec(url)?.pathname.groups.actor;
    const actor = await agent.api.app.bsky.actor.getProfile({
      actor: actorName!,
    }).then((res) => res.data);
    const page = profilePagePattern.exec(url)?.pathname.groups.page;

    if (page === "followers") {
      return new Response(
        await renderToStringAsync(
          await pages.ActorFollowers({ url: url, actor: actor }),
        ),
        headers,
      );
    }
    if (page === "follows") {
      return new Response(
        await renderToStringAsync(
          await pages.ActorFollows({ url: url, actor: actor }),
        ),
        headers,
      );
    }

    /*if (page === "posts") {
      return new Response(
        await renderToStringAsync(
          await pages.ActorFeed({ url: url, actor: actor }),
        ),
        headers,
      );
    }*/
  }

  return Response.redirect(
    `${url.protocol}${url.host}/profile/htmlsky.app/`,
    303,
  );
});

const headers: ResponseInit = {
  "headers": {
    "Content-Type": "text/html;charset=utf-8",
  },
};
