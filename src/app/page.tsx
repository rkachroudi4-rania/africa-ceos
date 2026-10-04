import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-navy text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold tracking-tight">Africa CEOs</span>
          <div className="flex gap-2">
            <Button asChild variant="ghost" className="text-white hover:bg-white/10">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild className="bg-white text-navy hover:bg-navy-50">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="bg-navy text-white">
          <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-navy-100">African leadership network</p>
              <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                Connect African business leaders, share insight, and grow opportunity.
              </h1>
              <p className="mt-5 max-w-xl text-navy-100">
                Africa CEOs is a professional platform for CEOs and executives to publish, network, and collaborate
                across the continent.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-emerald-700 hover:bg-emerald-800">
                  <Link href="/register">Create your profile</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10">
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  ["Professional profiles", "Company, sector, country and biography"],
                  ["Executive feed", "Publish, like and comment with peers"],
                  ["Trusted network", "Send, accept or refuse connection requests"],
                  ["Private messaging", "Continue conversations with your connections"],
                ].map(([title, body]) => (
                  <div key={title} className="rounded-xl bg-white/5 p-4">
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-navy-100">{body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-2xl font-semibold text-navy">Built for African executives</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Search by name, company, country or business sector. Keep your dashboard, notifications and settings in one
            professional workspace.
          </p>
        </section>
      </main>
    </div>
  );
}
