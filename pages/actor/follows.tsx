import { AppBskyActorDefs /*AppBskyFeedDefs*/ } from "npm:@atproto/api";
// import sanitizeHtml from "npm:sanitize-html";

// import { GetDescriptionFacets } from "../../facets.ts";
import { agent } from "../../main.tsx";
import { Head } from "../mod.ts";

export async function ActorFollows(
  { url, actor }: { url: URL; actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  let cursor = url.searchParams.get("cursor")!;

  const follows: AppBskyActorDefs.ProfileViewDetailed[] = await agent.api.app
    .bsky.graph.getFollows({ actor: actor.did, cursor: cursor }).then((res) =>
      res.data
    ).then(
      (res) => {
        cursor = res.cursor!;
        return res.follows;
      },
    );

  const followList: preact.VNode[] = [];

  follows.forEach((follow) => {
    followList.push(
      <p>
        <b>{follow.displayName ? follow.displayName : follow.handle}</b>
        <br />{" "}
        <a
          href={`/profile/${
            follow.handle !== "handle.invalid" ? follow.handle : follow.did
          }/`}
        >
          @{follow.handle}
        </a>
      </p>,
    );
  });

  if (cursor) {
    followList.push(<a href={`?cursor=${cursor}`}>Next page</a>);
  }

  return (
    <>
      <Head title={`People followed by @${actor.handle}`} />
      <header>
        <a href="..">Back</a>&nbsp;
        <span>
          <b>
            <i>
              {actor.displayName ? actor.displayName : actor.handle}'s Follows
            </i>
          </b>
        </span>

        <hr />
      </header>
      {followList}
    </>
  );
}
