import { RichText } from "npm:@atproto/api";
import * as ammonia from "https://deno.land/x/ammonia@0.3.1/mod.ts";
import { agent } from "./main.js";

await ammonia.init();

export function getFacets(text) {
  const rt = new RichText({ text: text });
  rt.detectFacetsWithoutResolution(agent);

  let res = "";
  for (const segment of rt.segments()) {
    if (segment.isLink()) res += `<a href="${segment.link.uri}">${segment.text}</a>`;
    else if (segment.isMention()) res += `<a href="/profile/${segment.mention.did}/">${segment.text}</a>`;
    else if (segment.isTag()) res += `<a href="https://bsky.app/hashtag/${segment.tag.tag}">${segment.text}</a>`;
    else res += segment.text;
  }

  res = ammonia.clean(res);
  res = res.replaceAll("\n", "<br>");

  return res;
}
