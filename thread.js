import { agent } from "./main.js";
import { getFacets } from "./facets.js";

const DateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "long",
  timeZone: "UTC",
  hour12: false,
});

export default class Thread {
  thread;

  constructor(thread) {
    this.thread = thread;
  }

  Post() {
    const thread = this.thread;
    const post = thread.post;
    const author = post.author;
    const record = post.record;

    author.displayName = author.displayName ? author.displayName : author.handle;
    author.handle = author.handle !== "handle.invalid" ? author.handle : author.did;
    author.avatar = author.avatar ? author.avatar : "/static/avatar.jpg";


    const text = record.text ? `<p>${getFacets(record.text, record.facets)}</p>` : "";

    return `
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${author.displayName}: ${post.record.text} &#8212; HTMLsky</title>
    </head>
    <table>
    <tr>
      <td valign="top" height="45" width="45">
	<img src="${author.avatar}" alt="${author.displayName}'s avatar" height="45" width="45">
      </td>
      <td>
	<h2>
	  <span>${author.displayName}</span><br>
	  <small><small><a href="/profile/${author.handle}">@${author.handle}</a></small></small>
	</h2>
      </td>
    </tr>
    <tr><td colspan="2">
    ${text}
    </td></tr>
    <tr><td colspan="2">&nbsp;</td></tr>
    <tr><td colspan="2">
      <i>${DateTimeFormat.format(new Date(record.createdAt))}</i>
    </td></tr>
    <tr><td colspan="2">
    <b>${post.replyCount}</b> replies &middot;
      <b>${post.repostCount}</b> reposts &middot;
      <b>${post.likeCount}</b> likes
    </td></tr>
    </table>
    <hr>
    `;
  }

  async Replies(prevCursor) {
    const thread = this.thread;
    return `
    <p>Replies are coming soon!</p>
    `;
    /*
    const feedList = [];

    for (const post of feed) {
      // add reply above post
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
	  const text = reply.record.text ? `<p>${getFacets(reply.record.text, reply.record.facets)}</p>` : "";
	  feedList.push(`
	  <tr>
	    <td>
	      <table>
		<tr><td>
		  <b>${reply.author.displayName ? reply.author.displayName : reply.author.handle}</b> (<a href="/profile/${reply.author.handle !== "handle.invalid" ? reply.author.handle : reply.author.did}/">@${reply.author.handle}</a>) &middot; ${DateTimeFormat.format(new Date(reply.record.createdAt))}
		</td></tr>
		<tr><td>
		${text}
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

      // Embeds
      const embeds = [];
      if (record.embed) {
	const embedType = record.embed["$type"];

	switch(embedType) {
	  case "app.bsky.embed.images":
	    embeds.push(`<ul>`);
	    for (const image of record.embed.images) {
	      // TODO: have a separate page for images with alt text and stuff?
	      const embedURL = `https://cdn.bsky.app/img/feed_fullsize/plain/${author.did}/${image.image.ref}@${image.image.mimeType.split("/")[1]}`;
	      embeds.push(`<li><a href="${embedURL}">${image.image.ref}</a> (${image.image.mimeType})</li>`);
	    }
	    embeds.push(`</ul>`);
	    break;
	  case "app.bsky.embed.record":
	    // TODO: record embed
	    break;
	  case "app.bsky.embed.recordWithMedia":
	    break;
	  default:
	  	embeds.push(`<pre>Missing embed type ${embedType}; <a href="https://todo.sr.ht/~jordanreger/htmlsky">please make an issue</a>.</pre>`);
	    break;
	}
      }

      const text = record.text ? `<p>${getFacets(record.text, record.facets)}</p>` : "";

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
	  ${text}
	  </td></tr>
	  <tr><td>
	    ${record.embed ? embeds.join("\n") : ``}
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
    */
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
