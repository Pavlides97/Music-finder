import { Mail, MessageCircleMore, Phone } from "lucide-react";

/** wa.me needs digits only with the country code; assume Cyprus (+357) for 8-digit local numbers. */
function whatsappNumber(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (phone.trim().startsWith("+") || digits.startsWith("00")) return digits.replace(/^00/, "");
  return digits.length === 8 ? `357${digits}` : digits;
}

/** Call / WhatsApp / Email buttons — big tap targets for phones. */
export function ContactButtons({
  phone,
  email,
  labels,
}: {
  phone?: string | null;
  email?: string | null;
  labels: { call: string; whatsapp: string; email: string };
}) {
  if (!phone && !email) return null;
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
      {phone && (
        <a href={`tel:${phone.replace(/\s+/g, "")}`} className="btn-ghost min-h-11 w-full">
          <Phone className="h-4 w-4" /> {labels.call}
        </a>
      )}
      {phone && (
        <a href={`https://wa.me/${whatsappNumber(phone)}`} target="_blank" rel="noopener noreferrer" className="btn-ghost min-h-11 w-full">
          <MessageCircleMore className="h-4 w-4 text-lime" /> {labels.whatsapp}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="btn-ghost min-h-11 w-full">
          <Mail className="h-4 w-4" /> {labels.email}
        </a>
      )}
    </div>
  );
}
