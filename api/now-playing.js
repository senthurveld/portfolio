// Vercel Node function: latest track from Last.fm (scrobbles Spotify plays, no OAuth needed).
// Env: LASTFM_API_KEY, LASTFM_USER. Without them the footer widget stays hidden.
export default async function handler(req, res) {
  const key = process.env.LASTFM_API_KEY;
  const user = process.env.LASTFM_USER;
  if (!key || !user) return res.status(503).json({ error: "not configured" });

  const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(user)}&api_key=${key}&format=json&limit=1`;
  try {
    const r = await fetch(url);
    const json = await r.json();
    const t = json?.recenttracks?.track?.[0];
    if (!t) throw new Error("no track");
    res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");
    return res.status(200).json({
      title: t.name,
      artist: t.artist?.["#text"] ?? "",
      url: t.url,
      playing: t["@attr"]?.nowplaying === "true",
    });
  } catch (e) {
    console.error("now-playing", e);
    return res.status(502).json({ error: "upstream" });
  }
}
