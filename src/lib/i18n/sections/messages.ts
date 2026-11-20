import { formatDate, formatEuro, valueLabel } from "../core";

/* eslint-disable @typescript-eslint/no-explicit-any */
type P = Record<string, any>;
const d = (l: "en" | "el", iso: string) => formatDate(l, iso);
const e = (l: "en" | "el", n: number) => formatEuro(l, n);

/** Automatic chat messages, stored as {k, p} and rendered in the reader's language. */
export const sys = {
  applied: [
    (p: P) => `Applied to “${p.title}” (${d("en", p.date)})${p.quote ? ` with a quote of ${e("en", p.quote)}` : ""}.`,
    (p: P) => `Αίτηση για «${p.title}» (${d("el", p.date)})${p.quote ? ` με τιμή ${e("el", p.quote)}` : ""}.`,
  ],
  hired: [
    (p: P) => `🎉 Hired for “${p.title}” on ${d("en", p.date)} at ${e("en", p.price)}. Booking confirmed.`,
    (p: P) => `🎉 Επιλέχθηκε για «${p.title}» στις ${d("el", p.date)} με ${e("el", p.price)}. Η κράτηση επιβεβαιώθηκε.`,
  ],
  shortlisted: [
    (p: P) => `⭐ ${p.venue} shortlisted the application for “${p.title}”.`,
    (p: P) => `⭐ Ο χώρος ${p.venue} έβαλε την αίτηση για «${p.title}» στη λίστα επιλογών.`,
  ],
  notSelected: [
    (p: P) => `The application for “${p.title}” wasn't selected this time. New gigs are posted every week.`,
    (p: P) => `Η αίτηση για «${p.title}» δεν επιλέχθηκε αυτή τη φορά. Νέες δουλειές δημοσιεύονται κάθε εβδομάδα.`,
  ],
  request: [
    (p: P) => `Booking request: ${valueLabel("en", p.event)} · ${d("en", p.date)} · ${e("en", p.price)}`,
    (p: P) => `Αίτημα κράτησης: ${valueLabel("el", p.event)} · ${d("el", p.date)} · ${e("el", p.price)}`,
  ],
  confirmed: [
    (p: P) => `Booking confirmed at ${e("en", p.price)} 🎉 — ${d("en", p.date)}, ${p.time}`,
    (p: P) => `Η κράτηση επιβεβαιώθηκε με ${e("el", p.price)} 🎉 — ${d("el", p.date)}, ${p.time}`,
  ],
  declined: [(p: P) => `Booking request declined by ${p.by}.`, (p: P) => `Το αίτημα κράτησης απορρίφθηκε από ${p.by}.`],
  counter: [
    (p: P) => `Counter-offer: ${e("en", p.price)} (was ${e("en", p.was)})`,
    (p: P) => `Αντιπροσφορά: ${e("el", p.price)} (από ${e("el", p.was)})`,
  ],
  cancelled: [
    (p: P) => `Booking for ${d("en", p.date)} was cancelled by ${p.by}.`,
    (p: P) => `Η κράτηση για ${d("el", p.date)} ακυρώθηκε από ${p.by}.`,
  ],
  completed: [
    (_p: P) => "Performance marked as completed. Thanks for booking through SoundCY!",
    (_p: P) => "Η εμφάνιση ολοκληρώθηκε. Ευχαριστούμε που κλείσατε μέσω SoundCY!",
  ],
} as const;

export const msg = {
  title: ["Messages", "Μηνύματα"],
  subMusician: ["Chat with venues & organisers", "Συνομιλίες με χώρους & διοργανωτές"],
  subVenue: ["Chat with musicians", "Συνομιλίες με μουσικούς"],
  none: ["No conversations yet.", "Δεν υπάρχουν συνομιλίες ακόμα."],
  applyToGig: ["Apply to a gig", "Κάνε αίτηση σε δουλειά"],
  findMusician: ["Find a musician", "Βρες μουσικό"],
  toStart: ["to get started.", "για να ξεκινήσεις."],
  noMessages: ["No messages yet", "Δεν υπάρχουν μηνύματα"],
  notFound: ["Conversation not found", "Η συνομιλία δεν βρέθηκε"],
  select: ["Select a conversation", "Επίλεξε συνομιλία"],
  selectText: [
    "Negotiate prices, confirm bookings and share event details — all in one thread.",
    "Διαπραγματεύσου τιμές, επιβεβαίωσε κρατήσεις και μοιράσου λεπτομέρειες — όλα σε μία συνομιλία.",
  ],
  back: ["Back to conversations", "Πίσω στις συνομιλίες"],
  venueSub: ["Venue / organiser", "Χώρος / διοργανωτής"],
  musicianSub: ["Musician", "Μουσικός"],
  newBooking: ["New booking", "Νέα κράτηση"],
  hello: [
    "Say hello! Share event details, ask about set lists and agree on a price — everything stays in one place.",
    "Πες ένα γεια! Μοιράσου λεπτομέρειες, ρώτα για το πρόγραμμα και συμφωνήστε τιμή — όλα σε ένα σημείο.",
  ],
  placeholder: [(n: string) => `Message ${n}…`, (n: string) => `Μήνυμα προς ${n}…`],
  message: ["Message", "Μήνυμα"],
  send: ["Send", "Αποστολή"],
  waitingVenue: ["Waiting for the venue to respond…", "Αναμονή απάντησης από τον χώρο…"],
  waitingMusician: ["Waiting for the musician to respond…", "Αναμονή απάντησης από τον μουσικό…"],
  counterPrice: ["Counter-offer price", "Τιμή αντιπροσφοράς"],
  accept: ["Accept", "Αποδοχή"],
  counter: ["Counter", "Αντιπροσφορά"],
  decline: ["Decline", "Απόρριψη"],
  withdraw: ["Withdraw", "Απόσυρση"],
  markCompleted: ["Mark completed", "Ολοκληρώθηκε"],
  cancelBooking: ["Cancel booking", "Ακύρωση κράτησης"],
  confirmCancel: ["Cancel this confirmed booking?", "Ακύρωση αυτής της επιβεβαιωμένης κράτησης;"],
} as const;
