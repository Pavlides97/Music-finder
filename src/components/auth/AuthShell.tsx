import { Photo } from "../ui/Photo";

export function AuthShell({ children, image, quote, alt }: { children: React.ReactNode; image: string; quote: string; alt: string }) {
  return (
    <div className="container-x grid min-h-[calc(100dvh-4rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">{children}</div>
      <div className="relative hidden h-[640px] overflow-hidden rounded-3xl lg:block">
        <Photo src={image} alt={alt} label="" w={1200} className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
        <p className="display absolute inset-x-0 bottom-0 p-10 text-3xl font-bold leading-tight">{quote}</p>
      </div>
    </div>
  );
}
