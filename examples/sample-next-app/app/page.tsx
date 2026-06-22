export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 space-y-6">
      <h1 className="text-3xl font-semibold">Sample app</h1>
      <p className="text-muted-foreground">
        Every color here comes from the shadcn variables in <code>app/globals.css</code>, which
        design-brief generated from <code>direction.json</code>. Re-lock a different direction and
        this page restyles itself — no component changes.
      </p>

      <div className="rounded-[var(--radius)] border border-border bg-card p-6 space-y-4">
        <div className="text-sm text-muted-foreground">Card surface</div>
        <button className="rounded-[var(--radius)] bg-primary px-4 py-2 font-medium text-primary-foreground">
          Primary action
        </button>
      </div>
    </main>
  );
}
