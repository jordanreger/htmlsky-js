import { agent, getRelativeDate } from "./main.js";
import { getFacets } from "./facets.js";

const DateTimeFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "short",
  timeStyle: "long",
  timeZone: "UTC",
  hour12: false,
});

export default class Actor {
  actor;

  constructor(actor) {
    this.actor = actor;
  }

  async Profile(prevCursor) {
    const actor = this.actor;

    actor.displayName = actor.displayName ? actor.displayName : actor.handle;
    actor.handle = actor.handle !== "handle.invalid" ? actor.handle : actor.did;
    actor.avatar = actor.avatar ? actor.avatar : "/static/avatar.jpg";

    actor.description = actor.description ? `<tr><td colspan="2"><p>${getFacets(actor.description)}</p></td></tr><tr><td colspan="2">&nbsp;</td></tr>` : "";

    return `
    <head>
      <meta name="color-scheme" content="light dark">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${actor.displayName} (@${actor.handle}) &#8212; HTMLsky</title>
    </head>
    <table>
    <tr>
      <td valign="top" height="60" width="60">
	<img src="${actor.avatar}" alt="${actor.displayName}'s avatar" height="60" width="60">
      </td>
      <td>
	<h1>
	  <span>${actor.displayName}</span><br>
	  <small><small><small><a href="/profile/${actor.handle}/">@${actor.handle}</a></small></small></small>
	</h1>
      </td>
    </tr>
    ${actor.description}
    <tr>
      <td colspan="2">
	<a href="/profile/${actor.handle}/followers/"><b>${actor.followersCount}</b> followers</a>
	<a href="/profile/${actor.handle}/follows/"><b>${actor.followsCount}</b> following</a>
	<a href="/profile/${actor.handle}/"><b>${actor.postsCount}</b> posts</a>
      </td>
    </tr>
    </table>
    <hr>
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
      // add reply above post
      if (post.reply) {
	const reply = post.reply.parent ? post.reply.parent : post.reply.root;

	const rkey = reply.uri.split("/").at(-1);
	
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
	  reply.author.displayName = reply.author.displayName ? reply.author.displayName : reply.author.handle;
	  reply.author.handle = reply.author.handle !== "handle.invalid" ? reply.author.handle : reply.author.did;

	  const text = reply.record.text ? `<p>${getFacets(reply.record.text, reply.record.facets)}</p>` : "";
	  feedList.push(`
	  <tr>
	    <td>
	      <table>
		<tr><td>
		  <b>${reply.author.displayName}</b><br><a href="/profile/${reply.author.handle}/">@${reply.author.handle}</a>
		  / <a href="/profile/${reply.author.handle}/post/${rkey}/">${rkey}</a> 
		</td></tr>
		<tr><td>
		${text}
		</td></tr>
		<tr><td>
		  <b>${reply.replyCount}</b> replies &middot;
		  <b>${reply.repostCount}</b> reposts &middot;
		  <b>${reply.likeCount}</b> likes
		  &mdash;
		  <time title="${DateTimeFormat.format(new Date(reply.record.createdAt))}"><i>${getRelativeDate(new Date(reply.record.createdAt))}</i></time>
		</td></tr>
	      </table>
	    </td>
	  </tr>
	  `);
	}
      }

      const record = post.post.record;
      const author = post.post.author;

      const rkey = post.post.uri.split("/").at(-1);

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
	      embeds.push(`<li><a href="${embedURL}">${image.alt ? image.alt : "image"}</a></li>`);
	    }
	    embeds.push(`</ul>`);
	    break;
	  case "app.bsky.embed.record":
	    // TODO: record embed
	    break;
	  case "app.bsky.embed.recordWithMedia":
	    // TODO: recordWithMedia embed
	    break;
	  case "app.bsky.embed.external":
	    // TODO: external embed
	  default:
	  	embeds.push(`<pre>Missing embed type ${embedType}; <a href="https://todo.sr.ht/~jordanreger/htmlsky">please make an issue</a>.</pre>`);
	    break;
	}
      }


      author.displayName = author.displayName ? author.displayName : author.handle;
      author.handle = author.handle !== "handle.invalid" ? author.handle : author.did;

      const text = record.text ? `<p>${getFacets(record.text, record.facets)}</p>` : "";

      feedList.push(`
      <tr><td>
	${post.reply ? `<blockquote>` : ``}
	<table>
	  ${actor.did !== author.did ? `<tr><td><i>Reposted by ${actor.displayName}</i></td></tr>` : ``}
	  <tr><td>
	    <b>${author.displayName}</b><br><a href="/profile/${author.handle}/">@${author.handle}</a>
	    / <a href="/profile/${author.handle}/post/${rkey}/">${rkey}</a>
	  </td></tr>
	  <tr><td>
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
	    &mdash;
	    <time title="${DateTimeFormat.format(new Date(record.createdAt))}"><i>${getRelativeDate(new Date(record.createdAt))}</i></time>
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
    <table>
      ${followsList.join("")}
    </table>
    `;
  }
}
