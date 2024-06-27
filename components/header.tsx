import { AppBskyActorDefs } from "npm:@atproto/api";

export function ActorHeader(actor: AppBskyActorDefs.ProfileViewDetailed) {
  return (
    <header>
      <nav>
        <span>
          <b>
            <i>HTMLsky</i>
          </b>&nbsp;
        </span>
        [ <a href="/">Home</a> ] [{" "}
        <a href="https://sr.ht/~jordanreger/htmlsky">Source</a> ] [{" "}
        <a href={`https://bsky.app/profile/${actor.did}`}>
          View on Bluesky
        </a>{" "}
        ]
      </nav>

      <hr />
    </header>
  );
}
