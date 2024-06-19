import { AppBskyActorDefs /*AppBskyFeedDefs*/ } from "npm:@atproto/api";
import sanitizeHtml from "npm:sanitize-html";

import { GetDescriptionFacets } from "../../facets.ts";

// Components
import { ActorHeader, Head } from "../mod.ts";

export async function Actor(
  { actor }: { actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  return (
    <>
      <Head
        title={actor.displayName
          ? actor.displayName + ` (@${actor.handle})`
          : `@${actor.handle}`}
      />
      <ActorHeader {...actor} />
      <table draggable={false}>
        <tr>
          <td>
            <img
              src={actor.avatar
                ? actor.avatar
                : "https://htmlsky.app/avatar.jpeg"}
              alt={`${sanitizeHtml(actor.displayName)}'s avatar`}
              width="90"
            />
          </td>
          <td>&nbsp;</td>
          <td>
            <small>
              <small>
                <small>
                  <span>&nbsp;</span>
                </small>
              </small>
            </small>
            <h1>
              <span
                dangerouslySetInnerHTML={{
                  __html: actor.displayName ? actor.displayName : actor.handle,
                }}
              >
              </span>
              <br />
              <small>
                <small>
                  <small>
                    <i>@{actor.handle}</i>
                  </small>
                </small>
              </small>
            </h1>
          </td>
        </tr>
      </table>

      <p>
        <span>
          <a href="./followers">
            <b>{actor.followersCount}</b> followers
          </a>
        </span>&nbsp;
        <span>
          <a href="./follows">
            <b>{actor.followsCount}</b> following
          </a>
        </span>&nbsp;
        <span>
          <b>{actor.postsCount}</b> posts
        </span>&nbsp;
      </p>

      <p
        dangerouslySetInnerHTML={{
          __html: (await GetDescriptionFacets(
            sanitizeHtml(actor.description),
          )).replaceAll("\n", "<br>"),
        }}
      >
      </p>

      <hr />

      <p>A list of posts will be here eventually.</p>
    </>
  );
}
