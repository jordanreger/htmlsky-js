import { agent } from "./main.js";
import { getFacets } from "./facets.js";

const DateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "long",
  timeZone: "UTC",
  hour12: false,
});

export default class Actor {
  uri;
  actor;

  constructor(uri) {
    this.uri = uri;
    this.actor = this.#get();
  }

  async #get() {
    const { data: actor } = await agent.api.app.bsky.actor.getProfile({
      actor: this.uri,
    });
    return actor;
  }

  async HTML(prevCursor) {
    const actor = await this.actor;

    actor.username = actor.displayName ? actor.displayName : actor.handle;
    actor.avatar = actor.avatar ? actor.avatar : "/static/avatar.jpg";
    actor.description = actor.description ? `<tr><td colspan="2"><p>${await getFacets(actor.description).then((res) => res.replaceAll("\n", "<br>"))}</p></td></tr><tr><td colspan="2">&nbsp;</td></tr>` : "";

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
    ${actor.description}
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

  async Feed(prevCursor) {
    const actor = await this.actor;
    let options = { actor: actor.did };
    if (prevCursor) {
      options = { actor: actor.did, cursor: prevCursor };
    }
    const { data } = await agent.api.app.bsky.feed.getAuthorFeed(options);
    const { feed, cursor } = data;

    const feedList = [];

    for (const post of feed) {
      if (post.reply) {
	const reply = post.reply.parent ? post.reply.parent : post.reply.root;
	if (reply.notFound || reply.blocked) {
	  feedList.push(`
	  <tr><td>
	    <table>
	      <tr><td>
		Post not found.
	      </td></tr>
	    </table>
	  </td></tr>
	  `);
	} else {
	  feedList.push(`
	  <tr>
	    <td>
	      <table>
		<tr><td>
		  <b>${reply.author.displayName ? reply.author.displayName : reply.author.handle}</b> (<a href="/profile/${reply.author.handle !== "handle.invalid" ? reply.author.handle : reply.author.did}/">@${reply.author.handle}</a>) &middot; ${DateTimeFormat.format(new Date(reply.record.createdAt))}
		</td></tr>
		<tr><td>
		  <p>${await getFacets(reply.record.text).then((res) => res.replaceAll("\n", "<br>"))}</p>
		</td></tr>
		<tr><td>
		  <b>${reply.replyCount}</b> replies &middot;
		  <b>${reply.repostCount}</b> reposts &middot;
		  <b>${reply.likeCount}</b> likes
		</td></tr>
	      </table>
	    </td>
	  </tr>
	  `);
	}
      }

      const record = post.post.record;
      const author = post.post.author;

      feedList.push(`
      <tr><td>
	${post.reply ? `<blockquote>` : ``}
	<table>
	  ${actor.did !== author.did ? `<tr><td><i>Reposted by ${actor.displayName ? actor.displayName : actor.handle}</i></td></tr>` : ``}
	  <tr><td>
	    <b>${author.displayName ? author.displayName : author.handle}</b> (<a href="/profile/${author.handle !== "handle.invalid" ? author.handle : author.did }/">@${author.handle}</a>)
	    &middot;
	    ${DateTimeFormat.format(new Date(record.createdAt))}
	  </td></tr>
	  <tr><td>
	    <p>${await getFacets(record.text).then((res) => res.replaceAll("\n", "<br>"))}</p>
	  </td></tr>
	  <tr><td>
	    ${/*post.post.record.embed ? `<pre>${JSON.stringify(post.post.record.embed, null, 2)}</pre>` : */``}
	  </td></tr>
	  <tr><td>
	    <b>${post.post.replyCount}</b> replies &middot;
	    <b>${post.post.repostCount}</b> reposts &middot;
	    <b>${post.post.likeCount}</b> likes
	  </td></tr>
	</table>
	${post.reply ? `</blockquote><hr>` : `<hr>`}
      </td></tr>
      `);
    }

    if (cursor) {
      feedList.push(`
      <tr><td>
      	<br>
      	<a href="?cursor=${cursor}">Next page</a>
      </td></tr>
      `);
    }


    return `
    <table width="100%">
      ${feedList.join("")}
    </table>
    `;
  }

  async Followers(prevCursor) {
    const actor = await this.actor;
    let options = { actor: actor.did };
    if (prevCursor) {
      options = { actor: actor.did, cursor: prevCursor };
    }

    const { data } = await agent.api.app.bsky.graph.getFollowers(options);
    const { followers, cursor } = data;

    const followersList = [];
    for (const follower of followers) {
      followersList.push(`
      <tr><td>
      	<b>${follower.displayName ? follower.displayName : follower.handle}</b> (<a href="/profile/${follower.handle !== "handle.invalid" ? follower.handle : follower.did}/">@${follower.handle}</a>)
      </td></tr>`);
    }

    if (cursor) {
      followersList.push(`
      <tr><td>
      	<br>
      	<a href="?cursor=${cursor}">Next page</a>
      </td></tr>
      `);
    }

    return `
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>People following @${actor.handle} &#8212; HTMLsky</title>
    </head>
    <p><a href="..">Back</a></p>
    <table>
      ${followersList.join("")}
    </table>
    `;
  }

  async Follows(prevCursor) {
    const actor = await this.actor;
    let options = { actor: actor.did };
    if (prevCursor) {
      options = { actor: actor.did, cursor: prevCursor };
    }

    const { data } = await agent.api.app.bsky.graph.getFollows(options);
    const { follows, cursor } = data;

    const followsList = [];
    for (const follow of follows) {
      followsList.push(`
      <tr><td>
      	<b>${follow.displayName ? follow.displayName : follow.handle}</b> (<a href="/profile/${follow.handle !== "handle.invalid" ? follow.handle : follow.did}/">@${follow.handle}</a>)
      </td>
 </tr>`);
    }

    if (cursor) {
      followsList.push(`
      <tr><td>
	<br>
	<a href="?cursor=${cursor}">Next page</a>
      </td></tr>
      `);
    }

    return `
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>People followed by @${actor.handle} &#8212; HTMLsky</title>
    </head>
    <p><a href="..">Back</a></p>
    <table>
      ${followsList.join("")}
    </table>
    `;
  }
}
