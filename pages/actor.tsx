import { AppBskyActorDefs /*AppBskyFeedDefs*/ } from "npm:@atproto/api";
import sanitizeHtml from "npm:sanitize-html";

import { agent } from "../main.tsx";
import { GetDescriptionFacets } from "../facets.tsx";

// Components
import { Head } from "../components/head.tsx";

/* MAIN PAGE */
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

      <p>
      {await GetDescriptionFacets(sanitizeHtml(actor.description))}
      </p>

      <hr />

      <p>A list of posts will be here eventually.</p>
    </>
  );
}

/* FOLLOWS */
export async function ActorFollows(
  { url, actor }: { url: URL; actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  const cursor = url.searchParams.get("cursor")!;

  const follows: AppBskyActorDefs.ProfileViewDetailed[] = await agent.api.app
    .bsky.graph.getFollows({ actor: actor.did, cursor: cursor }).then((res) =>
      res.data
    ).then(
      (res) => {
        //cursor = res.cursor!;
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

/* FOLLOWERS */
export async function ActorFollowers(
  { url, actor }: { url: URL; actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  const cursor = url.searchParams.get("cursor")!;

  const followers: AppBskyActorDefs.ProfileViewDetailed[] = await agent.api.app
    .bsky.graph.getFollowers({ actor: actor.did, cursor: cursor }).then((res) =>
      res.data
    ).then(
      (res) => {
        //cursor = res.cursor!;
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

/* FEED */
export async function ActorFeed(
  { url, actor }: { url: URL; actor: AppBskyActorDefs.ProfileViewDetailed },
) {
  // TODO: implement cursor
  const _prevCursor = url.searchParams.get("cursor")!;

  const { data } = await agent.api.app
    .bsky.feed.getAuthorFeed({ actor: actor.did });

  const { feed, cursor } = data;

  const feedList: preact.VNode[] = [];

  feed.forEach((post) => {
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
