const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const YOUTUBE_ID = /^[\w-]{11}$/;

/** Accepte un identifiant, un URI (`spotify:episode:…`) ou un lien open.spotify.com. */
export function parseSpotifyId(value: string): string | undefined {
  const input = value.trim();
  if (SPOTIFY_ID.test(input)) return input;

  const uri = input.match(/^spotify:episode:([A-Za-z0-9]{22})$/);
  if (uri) return uri[1];

  try {
    const url = new URL(input);
    if (url.hostname !== "open.spotify.com") return undefined;
    const id = url.pathname.match(/\/episode\/([A-Za-z0-9]{22})/)?.[1];
    return id;
  } catch {
    return undefined;
  }
}

export function parseYoutubeId(value: string): string | undefined {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return undefined;
  }

  const hostname = url.hostname.replace(/^www\./, "");
  const id =
    hostname === "youtu.be"
      ? url.pathname.split("/")[1]
      : hostname === "youtube.com" || hostname === "m.youtube.com"
        ? (url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1])
        : undefined;

  return id && YOUTUBE_ID.test(id) ? id : undefined;
}
