/** Public base URL (set SITE_URL in production, e.g. https://soundcy.com). */
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
