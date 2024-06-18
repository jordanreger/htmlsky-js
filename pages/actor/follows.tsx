import { AppBskyActorDefs /*AppBskyFeedDefs*/ } from "npm:@atproto/api";
// import sanitizeHtml from "npm:sanitize-html";

// import { GetDescriptionFacets } from "../../facets.ts";
import { agent } from "../../main.tsx";
import { Head } from "../mod.ts";

export async function ActorFollows(
  { actor }: { actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  // TODO: implement cursor

  const follows: AppBskyActorDefs.ProfileViewDetailed[] = await agent.api.app
    .bsky.graph.getFollows({ actor: actor.did }).then((res) => res.data).then(
      (res) => res.follows,
    );

  const followList: preact.VNode[] = [];

  follows.forEach((follow) => {
    followList.push(
      <li>
        <a href={`/profile/${follow.did}`}>{follow.handle}</a>
      </li>,
    );
  });
  return (
    <>
      <Head />
      <a href="..">Back</a>&nbsp;
      <span>
        {actor.displayName ? actor.displayName : actor.handle}'s Follows
      </span>
      <hr />
      <ul>{followList}</ul>
    </>
  );
}
