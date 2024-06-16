import { AppBskyActorDefs, AppBskyFeedDefs } from "npm:@atproto/api";
import sanitizeHtml from "npm:sanitize-html";

import { GetDescriptionFacets } from "../facets.ts";

// Components
import { ActorHeader } from "./header.tsx";

export async function Actor(
  actor: AppBskyActorDefs.ProfileViewDetailed,
  // TODO: add posts from feed
  _feed: AppBskyFeedDefs.FeedViewPost,
) {
  return (
    <>
      <ActorHeader {...actor} />
      <table>
        <tr>
          <td>
            <img
              src={actor.avatar}
              alt={`${sanitizeHtml(actor.displayName)}'s avatar`}
              width="65"
              height="65"
            />
          </td>
          <td>
            <h1 style="margin:0;">{sanitizeHtml(actor.displayName)}</h1>
            <span>@{actor.handle}</span>
          </td>
        </tr>
      </table>

      <p>
        <b>{actor.followersCount}</b> followers&nbsp;
        <b>{actor.followsCount}</b> following&nbsp;
        <b>{actor.postsCount}</b> posts&nbsp;
      </p>

      <p
        style="white-space:pre-line;"
        dangerouslySetInnerHTML={{
          __html: await GetDescriptionFacets(
            sanitizeHtml(actor.description),
          ),
        }}
      >
      </p>

      <hr />

      <p>A list of posts will be here eventually.</p>
    </>
  );
}
