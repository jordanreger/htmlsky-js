import { serve } from "https://deno.land/std@0.105.0/http/server.ts";

const server = serve({ port: 8000 });

console.log("HTTP webserver running. Access it at: http://localhost:8000/");

for await (const request of server) {
  const url = request.url;
  let profileContent = "";

  const match = url.match(/^\/profile\/(.+)$/);
  if (match) {
    const handle = match[1];
    try {
      const response = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=${handle}`);
      if (response.ok) {
        const data = await response.json();
        const { avatar, displayName, handle, description, followersCount, followsCount, postsCount } = data;

        console.log(data);

        if ("" == displayName) 
          displayName == "No Display Name";

        profileContent = `
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
      } else {
        profileContent = "<p>Failed to fetch profile data.</p>";
      }
    } catch (error) {
      profileContent = `<p>Error: ${error.message}</p>`;
    }
  } else {
    profileContent = "<p>No profile handle provided in the URL.</p>";
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light dark">
      <title>HTML Sky</title>
    </head>
    <body>
      ${profileContent}
    </body>
    </html>
  `;

  request.respond({ status: 200, body: html });
}

