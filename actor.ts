import {
  AppBskyActorDefs,
  AppBskyFeedGetAuthorFeed,
  AppBskyFeedPost,
  AppBskyGraphGetFollowers,
} from "npm:@atproto/api";

import { agent } from "./main.ts";
import { getDescriptionFacets } from "./facets.ts";

const DateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "long",
  timeZone: "UTC",
  hour12: false,
});

export default class Actor {
  uri: string;
  actor: Promise<AppBskyActorDefs.ProfileViewDetailed>;

  constructor(uri: string) {
    this.uri = uri;
    this.actor = this.#get();
  }

  async #get() {
    const { data: actor } = await agent.api.app.bsky.actor.getProfile({
      actor: this.uri,
    });
    return actor;
  }

  async Raw(): Promise<string> {
    const actor = await this.actor;

    return JSON.stringify(actor, null, 2);
  }

  async HTML(prevCursor?: string): Promise<string> {
    const actor = await this.actor;

    actor.username = actor.displayName ? actor.displayName : actor.handle;
    actor.avatar = actor.avatar ? actor.avatar : "/static/avatar.jpg";

    return `
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${actor.username} (@${actor.handle}) &#8212; HTMLsky</title>
    </head>
    <table>
    <tr>
      <td valign="top" height="60" width="60">
	<img src="${actor.avatar}" alt="${actor.username}'s avatar" height="60" width="60">
      </td>
      <td>
	<h1>
	  <span>${actor.username}</span><br>
	  <small><small><small>@${actor.handle}</small></small></small>
	</h1>
      </td>
    </tr>
    ${
      actor.description
        ? `<tr>
      <td colspan="2">
	<p>${await getDescriptionFacets(actor.description).then((res) =>
          res.replaceAll("\n", "<br>")
        )}</p>
      </td>
    </tr>
    <tr>
      <td colspan="2">&nbsp;</td>
    </tr>`
        : ``
    }
    <tr>
      <td colspan="2">
	<a href="./followers/"><b>${actor.followersCount}</b> followers</a>
	<a href="./follows/"><b>${actor.followsCount}</b> following</a>
	<b>${actor.postsCount}</b> posts
      </td>
    </tr>
    </table>
    <hr>
    ${prevCursor ? await this.Feed(prevCursor) : await this.Feed()}
    `;
  }

  async Feed(prevCursor?: string): Promise<string> {
    const actor = await this.actor;
    let options: AppBskyFeedGetAuthorFeed.QueryParams = { actor: actor.did };
    if (prevCursor) {
      options = { actor: actor.did, cursor: prevCursor };
    }
    const { data } = await agent.api.app.bsky.feed.getAuthorFeed(options);
    const { feed, cursor } = data;

    const feedList: string[] = [];
    feed.forEach((post) => {
      const postAuthor = post.post.author,
        reply = post.reply?.root,
        record: AppBskyFeedPost.Record = post.post.record;
      let replyAuthor: AppBskyActorDefs.ProfileView | undefined;
      if (reply) replyAuthor = reply.author;
      else replyAuthor = undefined;
      console.log(post);
      feedList.push(`
      <tr>
	<td>
	${
        reply
          ? `
	  <table>
	  <tr><td><b>${
            replyAuthor.displayName
              ? replyAuthor.displayName
              : replyAuthor.handle
          }</b> (@<a href="/profile/${
            replyAuthor.handle !== "handle.invalid"
              ? replyAuthor.handle
              : replyAuthor.did
          }">${replyAuthor.handle}</a>)</td></tr>
	  <tr><td>${reply.record.text}</td></tr>
	  <tr><td>${DateTimeFormat.format(new Date(reply.record.createdAt))}</td></tr>
	  <tr><td><br></td></tr>
	</table>
	<blockquote>
	`
          : ""
      }
	<table>
	  ${
        actor.did !== postAuthor.did
          ? `<tr><td><i>Reposted by ${
            actor.displayName ? actor.displayName : actor.handle
          }</i></td></tr>`
          : ``
      }
	  <tr><td><b>${
        postAuthor.displayName ? postAuthor.displayName : postAuthor.handle
      }</b> (@<a href="/profile/${
        postAuthor.handle !== "handle.invalid"
          ? postAuthor.handle
          : postAuthor.did
      }">${postAuthor.handle}</a>)</td></tr>
	  <tr><td>${record.text}</td></tr>
	  <tr><td>${DateTimeFormat.format(new Date(record.createdAt))}</td></tr>
	  <tr><td><br></td></tr>
	</table>
	${post.reply ? "</blockquote>" : ""}
	</td>
      </tr>
      `);
    });

    if (cursor) {
      feedList.push(`
      <tr>
	<td><br><a href="?cursor=${cursor}">Next page</a></td>
      </tr>
      `);
    }

    return `
    <table>
      ${feedList.join("")}
    </table>
    `;
  }

  async Followers(prevCursor?: string): Promise<string> {
    const actor = await this.actor;
    let options: AppBskyGraphGetFollowers.QueryParams = { actor: actor.did };
    if (prevCursor) {
      options = { actor: actor.did, cursor: prevCursor };
    }

    const { data } = await agent.api.app.bsky.graph.getFollowers(options);
    const { followers, cursor } = data;

    const followersList: string[] = [];
    followers.forEach((follower) => {
      followersList.push(`
      <tr>
	<td><b>${
        follower.displayName ? follower.displayName : follower.handle
      }</b> (@${follower.handle})</td>
      </tr>`);
    });

    if (cursor) {
      followersList.push(`
      <tr>
	<td><br><a href="?cursor=${cursor}">Next page</a></td>
      </tr>
      `);
    }

    return `
    <p><a href="..">Back</a></p>
    <table>
      ${followersList.join("")}
    </table>
    `;
  }

  async Follows(prevCursor?: string): Promise<string> {
    const actor = await this.actor;
    let options: AppBskyGraphGetFollowers.QueryParams = { actor: actor.did };
    if (prevCursor) {
      options = { actor: actor.did, cursor: prevCursor };
    }

    const { data } = await agent.api.app.bsky.graph.getFollows(options);
    const { follows, cursor } = data;

    const followsList: string[] = [];
    follows.forEach((follow) => {
      followsList.push(`
      <tr>
	<td><b>${
        follow.displayName ? follow.displayName : follow.handle
      }</b> (<a href="/profile/${
        follow.handle !== "handle.invalid" ? follow.handle : follow.did
      }">@${follow.handle}</a>)</td>
      </tr>`);
    });

    if (cursor) {
      followsList.push(`
      <tr>
	<td><br><a href="?cursor=${cursor}">Next page</a></td>
      </tr>
      `);
    }

    return `
    <p><a href="..">Back</a></p>
    <table>
      ${followsList.join("")}
    </table>
    `;
  }
}
