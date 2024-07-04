import { RichText } from "npm:@atproto/api";
import { agent } from "./main.js";

export async function getFacets(text) {
  const rt = new RichText({ text: text });
  await rt.detectFacets(agent);

  let res = "";

  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      res += `<a href="${segment.link.uri}">${segment.text}</a>`;
    } else if (segment.isMention()) {
      res += `<a href="/profile/${segment.mention.did}/">${segment.text}</a>`;
    } else if (segment.isTag()) {
      res += `<a href="https://bsky.app/hashtag/${segment.tag.tag}">${segment.text}</a>`;
    } else {
      res += segment.text;
    }
  }

  return res;
}

export async function getDescriptionFacets(text) {
  const rt = new RichText({ text: text });
  await rt.detectFacets(agent);

  let res = "";

  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      res += `<a href="${segment.link.uri}">${segment.text}</a>`;
    } else if (segment.isMention()) {
      res += `<a href="/profile/${segment.mention.did}/">${segment.text}</a>`;
    } else if (segment.isTag()) {
      res += `<a href="https://bsky.app/hashtag/${segment.tag.tag}">${segment.text}</a>`;
    } else {
      res += segment.text;
    }
  }

  return res;
}
