import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="display text-8xl font-extrabold text-gradient">404</p>
      <h1 className="display mt-4 text-3xl font-bold">This track skipped.</h1>
      <p className="mt-2 text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-primary">Back home</Link>
        <Link href="/musicians" className="btn-ghost">Find musicians</Link>
      </div>
    </div>
  );
}
