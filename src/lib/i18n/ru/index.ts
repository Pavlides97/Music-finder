import type { Dict } from "../index";
import { cards, common, dir, footer, genreBlurb, home, nav, search, stars, status } from "./part1";
import { auth, booking, errors, gig, profile, venue } from "./part2";
import { dash, match, msg, sys } from "./part3";
import { pf } from "./part4";
import { about, ai, wo } from "./part5";

/** Russian dictionary — typed against the English one, so a missing key fails the build. */
export const ru: Dict = {
  common, nav, cards, status, stars, search, footer,
  home, genreBlurb, dir, profile, booking, gig, venue, auth, errors, msg, sys, dash, match, pf, wo, ai, about,
};
