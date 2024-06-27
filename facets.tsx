import { RichText } from "npm:@atproto/api";

import { agent } from "./main.tsx";

export async function GetDescriptionFacets(
  description: string,
): Promise<preact.VNode[]> {
  const rt = new RichText({ text: description });
  await rt.detectFacets(agent);

  const descriptionWithFacets: preact.VNode[] = [];

  for (const segment of rt.segments()) {
    if (segment.isLink()) {
      descriptionWithFacets.push(
        <a href={`${segment.link?.uri}`}>{segment.text}</a>,
      );
    } else if (segment.isMention()) {
      descriptionWithFacets.push(
        <a href={`/profile/${segment.mention?.did}`}>{segment.text}</a>,
      );
    } else {
      descriptionWithFacets.push(<>{segment.text</>);
    }
  }

  return descriptionWithFacets;
}
