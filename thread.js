import { agent, getRelativeDate, DateTimeFormat } from "./main.js";
import { getFacets } from "./facets.js";

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
	  <small><small><a href="/profile/${author.handle}/">@${author.handle}</a></small></small>
	</h2>
      </td>
    </tr>
    <tr><td colspan="2">
    ${text}
    </td></tr>
    <tr><td colspan="2">&nbsp;</td></tr>
    <tr><td colspan="2">
    <b>${post.replyCount}</b> replies &middot;
      <b>${post.repostCount}</b> reposts &middot;
      <b>${post.likeCount}</b> likes
      &mdash;
      <time title="${DateTimeFormat.format(new Date(record.createdAt))}"><i>${getRelativeDate(new Date(record.createdAt))}</i></time>
    </td></tr>
    </table>
    <hr>
    `;
  }

  async Replies(prevCursor) {
    const thread = this.thread;
    const replies = thread.replies;

    const feedList = [];

    for (const post of replies) {
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
	      embeds.push(`<li><a href="${embedURL}">${image.alt}</a></li>`);
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


      author.displayName = author.displayName ? author.displayName : author.handle;
      author.handle = author.handle !== "handle.invalid" ? author.handle : author.did;

      const text = record.text ? `<p>${getFacets(record.text, record.facets)}</p>` : "";

      feedList.push(`
      <tr><td>
	${post.reply ? `<blockquote>` : ``}
	<table>
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

    /*
    if (cursor) {
      feedList.push(`
      <tr><td>
      	<br>
      	<a href="?cursor=${cursor}">Next page</a>
      </td></tr>
      `);
    }
    */

    return `
    <table width="100%">
      ${feedList.join("")}
    </table>
    `;
  }
}
