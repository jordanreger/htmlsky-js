import {
  AppBskyActorDefs,
  AppBskyFeedDefs,
  AppBskyFeedPost,
} from "npm:@atproto/api";

// import sanitizeHtml from "npm:sanitize-html";

// import { GetDescriptionFacets } from "../../facets.ts";
import { agent } from "../../main.tsx";

export async function ActorFeed(
  { _url, actor }: { url: URL; actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  // let cursor = url.searchParams.get("cursor")!;

  const { data } = await agent.api.app
    .bsky.feed.getAuthorFeed({ actor: actor.did });

  const { feed, cursor } = data;
  /*.then(
      (res) => {
        cursor = res.cursor!;
        return res.feed;
      },
    );*/

  const feedList: preact.VNode[] = [];

  feed.forEach((post) => {
    console.log(post.post);
    feedList.push(
      <p>
        {post.post}
      </p>,
    );
  });

  if (cursor) {
    feedList.push(<a href={`?cursor=${cursor}`}>Next page</a>);
  }

  return (
    <>
      {feedList}
    </>
  );
}
