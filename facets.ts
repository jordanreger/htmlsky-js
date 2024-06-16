import { AtpAgent, RichText } from "npm:@atproto/api";

const agent = new AtpAgent({ service: "https://public.api.bsky.app" });

export async function GetDescriptionFacets(
  description: string,
): Promise<string> {
  const rt = new RichText({ text: description });
  await rt.detectFacets(agent);

  let descriptionWithFacets = "";

  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      descriptionWithFacets +=
        `<a href="${segment.link?.uri}">${segment.text}</a>`;
    } else if (segment.isMention()) {
      descriptionWithFacets +=
        `<a href="/profile/${segment.mention?.did}">${segment.text}</a>`;
    } else {
      descriptionWithFacets += segment.text;
    }
  }

  return descriptionWithFacets;
}
