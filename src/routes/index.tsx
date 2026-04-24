import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { OrderForm } from "@/components/OrderForm";
import { Button } from "@/components/ui/button";
import heroMilk from "@/assets/hero-milk.jpg";
import logo from "@/assets/logo.png";
import {
  Clock,
  Snowflake,
  ShieldCheck,
  Truck,
  Star,
  Phone,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FreshMilk — Premium Milk Delivery in Addis Ababa" },
      {
        name: "description",
        content:
          "Order farm-fresh milk delivered to your door in Addis Ababa. Just 100 Birr per liter. Fast, reliable, no account needed.",
      },
      { property: "og:title", content: "FreshMilk — Premium Milk Delivery" },
      {
        property: "og:description",
        content: "Farm-fresh milk delivered fast. 100 Birr per liter. Order now.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Toaster position="top-center" richColors />

      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-40 backdrop-blur-md bg-background/70 border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-bold text-lg">
            <img
              src={logo}
              alt="FreshMilk logo"
              className="h-9 w-9 object-contain"
            />
            FreshMilk
          </a>
          <a href="#order">
            <Button size="sm" className="h-10 px-5">
              Order Now
            </Button>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section
        id="top"
        className="relative pt-28 pb-16 sm:pt-32 sm:pb-20 overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-10 md:grid-cols-2 md:items-center">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground mb-5">
              <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
              Same-day delivery in Addis Ababa
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              Farm-fresh milk,
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                delivered to your door.
              </span>
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Pure, chilled milk straight from our local farms. Just 100 Birr per liter —
              order in seconds, no account required.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#order">
                <Button
                  size="lg"
                  className="h-14 px-8 text-base font-semibold"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                >
                  Order Milk Now
                </Button>
              </a>
              <a href="#about">
                <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                  Learn More
                </Button>
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br from-primary to-primary-glow"
                    />
                  ))}
                </div>
                <span className="font-medium text-foreground">2,400+ happy customers</span>
              </div>
            </div>
          </div>

          <div className="relative animate-fade-up" style={{ animationDelay: "0.15s" }}>
            <div
              className="absolute -inset-8 rounded-full blur-3xl opacity-40"
              style={{ background: "var(--gradient-primary)" }}
            />
            <div className="relative rounded-3xl overflow-hidden shadow-[var(--shadow-elegant)] animate-float">
              <img
                src={heroMilk}
                alt="Fresh bottle of milk"
                width={1280}
                height={1280}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-[var(--shadow-soft)] border flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
                <Truck className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Average delivery</div>
                <div className="font-bold text-sm">Under 60 minutes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              Why FreshMilk
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              The fastest way to get fresh milk
            </h2>
            <p className="mt-4 text-muted-foreground">
              We partner with local dairy farms to deliver chilled, pure milk to your home —
              fast, reliable, and at a fair price.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Snowflake,
                title: "Always Fresh",
                desc: "Milk is chilled and delivered within hours of being collected from local farms.",
              },
              {
                icon: Clock,
                title: "Lightning Fast",
                desc: "Same-day delivery across Addis Ababa — average arrival in under one hour.",
              },
              {
                icon: ShieldCheck,
                title: "Fair Pricing",
                desc: "Just 100 Birr per liter. No hidden fees. Pay on delivery — cash or mobile.",
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border p-7 bg-card hover:shadow-[var(--shadow-soft)] transition-all"
              >
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center text-primary-foreground mb-5"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-secondary/40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              Testimonials
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Loved across the city</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                name: "Sara T.",
                area: "Bole",
                text: "I order every morning. The milk is always cold and fresh, and the delivery is incredibly fast.",
              },
              {
                name: "Daniel M.",
                area: "Kazanchis",
                text: "Best milk delivery service in Addis. Fair price, friendly drivers, never late.",
              },
              {
                name: "Hanna G.",
                area: "CMC",
                text: "So easy to order — no app, no account. Just enter your details and they call you back.",
              },
            ].map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-card border p-7 shadow-[var(--shadow-soft)]"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 fill-primary text-primary"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
                <div className="mt-5 pt-5 border-t flex items-center gap-3">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-primary-foreground font-semibold"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.area}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Order */}
      <section id="order" className="py-20 sm:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              Place your order
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold">
              Order in under 30 seconds
            </h2>
            <p className="mt-3 text-muted-foreground">
              Fill in your details — we'll call you to confirm and deliver.
            </p>
          </div>
          <OrderForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <img
              src={logo}
              alt="FreshMilk logo"
              className="h-8 w-8 object-contain"
            />
            FreshMilk
          </div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Call to order: +251 9XX XXX XXX
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} FreshMilk. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
