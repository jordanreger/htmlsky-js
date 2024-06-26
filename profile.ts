import { AtpAgent } from "npm:@atproto/api";
import Page from "./page.ts";

const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

export default class Profile extends Page {
  handle: string;

  constructor(handle: string) {
    super();
    this.handle = handle;
  }

  async generateProfile() {
    const { data } = await agent.api.app.bsky.actor.getProfile({
      actor: this.handle,
    });
    const {
      avatar,
      displayName,
      handle,
      followersCount,
      followsCount,
      postsCount,
    } = data;

    return `
      <div class="profile">
        <table width="95%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" valign="middle">
              <table width="40%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="right">
                    <nobr>
                      <h1>${displayName}<br>
                        <sup><sup><small><small>@${handle}</small></small></sup></sup>
                      </h1>
                    </nobr>
                    <small>
                      <span>
                        <nobr>
                        Followers <strong>${followersCount}</strong>&nbsp;
                        Following <strong>${followsCount}</strong>&nbsp;
                        Posts <strong>${postsCount}</strong>
                        </nobr>
                      </span>
                    <small>
                  </td>
                  <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>
                  <td valign="bottom" align="left">
                    <img alt="" draggable="false" src="${avatar}" width="115">
                  </td>

                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
  }
}
