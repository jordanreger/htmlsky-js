import { ProfileView } from "npm:@atproto/api";

import { agent } from "./main.ts";
import { getDescriptionFacets } from "./facets.ts";

export default class Actor {
  uri: string;
  actor: ProfileView;

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

  async Raw(): string {
    const actor = await this.actor;

    return JSON.stringify(actor, null, 2);
  }

  async HTML(): string {
    const actor = await this.actor;

    actor.username = actor.displayName ? actor.displayName : actor.handle;
    actor.avatar = actor.avatar ? actor.avatar : "/static/avatar.jpg";

    return `
    <head>
      <meta name="color-scheme" content="light dark">
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
    ${actor.description ? `<tr>
      <td colspan="2">
	<p>${await getDescriptionFacets(actor.description).then(res => res.replaceAll("\n", "<br>"))}</p>
      </td>
    </tr>
    <tr>
      <td colspan="2">&nbsp;</td>
    </tr>`
    : ``}
    <tr>
      <td colspan="2">
	<b>${actor.followersCount}</b> followers
	<b>${actor.followsCount}</b> following
	<b>${actor.postsCount}</b> posts
      </td>
    </tr>
    </table>
    <hr>
    `;
  }
}
