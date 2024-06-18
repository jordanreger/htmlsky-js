import { AppBskyActorDefs /*AppBskyFeedDefs*/ } from "npm:@atproto/api";
// import sanitizeHtml from "npm:sanitize-html";

// import { GetDescriptionFacets } from "../../facets.ts";
import { agent } from "../../main.tsx";

export async function ActorFollowers(
  { actor }: { actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  // TODO: implement cursor

  const followers: AppBskyActorDefs.ProfileViewDetailed[] = await agent.api.app
    .bsky.graph.getFollowers({ actor: actor.did }).then((res) => res.data).then(
      (res) => res.followers,
    );

  const followersList: preact.VNode[] = [];

  followers.forEach((follower) => {
    followersList.push(
      <li>
        <a href={`/profile/${follower.did}`}>{follower.handle}</a>
      </li>,
    );
  });
  return (
    <>
      <header>
        <a href="..">Back</a>&nbsp;
        <span>
          {actor.displayName ? actor.displayName : actor.handle}'s Followers
        </span>

        <hr />
      </header>
      <ul>{followersList}</ul>
    </>
  );
}
