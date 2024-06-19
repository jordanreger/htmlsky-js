import { AppBskyActorDefs /*AppBskyFeedDefs*/ } from "npm:@atproto/api";
// import sanitizeHtml from "npm:sanitize-html";

// import { GetDescriptionFacets } from "../../facets.ts";
import { agent } from "../../main.tsx";
import { Head } from "../mod.ts";

export async function ActorFollowers(
  { url, actor }: { url: URL; actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  // TODO: implement cursor

  let cursor = url.searchParams.get("cursor")!;

  const followers: AppBskyActorDefs.ProfileViewDetailed[] = await agent.api.app
    .bsky.graph.getFollowers({ actor: actor.did, cursor: cursor }).then((res) =>
      res.data
    ).then(
      (res) => {
        cursor = res.cursor!;
        return res.followers;
      },
    );

  const followersList: preact.VNode[] = [];

  followers.forEach((follower) => {
    followersList.push(
      <p>
        <b>{follower.displayName ? follower.displayName : follower.handle}</b>
        <br /> <a href={`/profile/${follower.handle}/`}>@{follower.handle}</a>
      </p>,
    );
  });

  if (cursor) {
    followersList.push(<a href={`?cursor=${cursor}`}>Next page</a>);
  }

  return (
    <>
      <Head title={`People following @${actor.handle}`} />
      <header>
        <a href="..">Back</a>&nbsp;
        <span>
          <b>
            <i>
              {actor.displayName ? actor.displayName : actor.handle}'s Followers
            </i>
          </b>
        </span>

        <hr />
      </header>
      {followersList}
    </>
  );
}
