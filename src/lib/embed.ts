export function toEmbed(url: string): { kind: "youtube" | "spotify"; src: string } | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtube.com" && u.searchParams.get("v")) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${u.searchParams.get("v")}` };
    if (host === "youtube.com" && u.pathname.startsWith("/shorts/")) return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed/${u.pathname.split("/")[2]}` };
    if (host === "youtu.be") return { kind: "youtube", src: `https://www.youtube-nocookie.com/embed${u.pathname}` };
    if (host === "open.spotify.com") {
      const [, type, id] = u.pathname.replace("/embed", "").split("/");
      if (type && id) return { kind: "spotify", src: `https://open.spotify.com/embed/${type}/${id}` };
    }
  } catch {}
  return null;
}
