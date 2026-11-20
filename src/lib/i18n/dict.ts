import { cards, common, footer, nav, search, stars, status } from "./sections/common";
import { home, genreBlurb } from "./sections/home";
import { dir } from "./sections/directory";
import { booking, profile } from "./sections/profile";
import { gig, venue } from "./sections/gigs";
import { auth, errors } from "./sections/auth";
import { msg, sys } from "./sections/messages";
import { dash } from "./sections/dashboard";
import { match } from "./sections/match";
import { pf } from "./sections/profileForm";
import { about, ai, wo } from "./sections/features3";

export const DICT = {
  common, nav, cards, status, stars, search, footer,
  home, genreBlurb, dir, profile, booking, gig, venue, auth, errors, msg, sys, dash, match, pf, wo, ai, about,
} as const;
