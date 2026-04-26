import { createFileRoute } from "@tanstack/react-router";
import { Clock, Snowflake, ShieldCheck, Truck, Star, Phone } from "lucide-react";
import { OrderForm } from "@/components/OrderForm";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import heroMilk from "@/assets/hero-milk.jpg";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FreshMilk - Premium Milk Delivery in Addis Ababa" },
      {
        name: "description",
        content:
          "Order farm-fresh milk delivered to your door in Addis Ababa. Just 100 Birr per liter. Fast, reliable, no account needed.",
      },
      { property: "og:title", content: "FreshMilk - Premium Milk Delivery" },
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

      <header className="fixed inset-x-0 top-0 z-40 border-b bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2 text-lg font-bold">
            <img src={logo} alt="FreshMilk logo" className="h-9 w-9 object-contain" />
            FreshMilk
          </a>
          <a href="#order">
            <Button size="sm" className="h-10 px-5">
              Order Now
            </Button>
          </a>
        </div>
      </header>

      <section
        id="top"
        className="relative overflow-hidden pb-16 pt-28 sm:pb-20 sm:pt-32"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-2 md:items-center">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              Same-day delivery in Addis Ababa
            </div>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
              Farm-fresh milk,
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                delivered to your door.
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pure, chilled milk straight from our local farms. Just 100 Birr per liter - order in
              seconds, no account required.
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
                  {[1, 2, 3, 4].map((value) => (
                    <div
                      key={value}
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
            <div className="relative overflow-hidden rounded-3xl shadow-[var(--shadow-elegant)] animate-float">
              <img
                src={heroMilk}
                alt="Fresh bottle of milk"
                width={1280}
                height={1280}
                className="h-auto w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-2xl border bg-card p-4 shadow-[var(--shadow-soft)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <Truck className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Average delivery</div>
                <div className="text-sm font-bold">Under 60 minutes</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Why FreshMilk
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              The fastest way to get fresh milk
            </h2>
            <p className="mt-4 text-muted-foreground">
              We partner with local dairy farms to deliver chilled, pure milk to your home - fast,
              reliable, and at a fair price.
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
                desc: "Same-day delivery across Addis Ababa - average arrival in under one hour.",
              },
              {
                icon: ShieldCheck,
                title: "Fair Pricing",
                desc: "Just 100 Birr per liter. No hidden fees. Pay on delivery - cash or mobile.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-7 transition-all hover:shadow-[var(--shadow-soft)]"
              >
                <div
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl text-primary-foreground"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Testimonials
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Loved across the city</h2>
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
                text: "So easy to order - no app, no account. Just enter your details and they call you back.",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.name}
                className="rounded-2xl border bg-card p-7 shadow-[var(--shadow-soft)]"
              >
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">"{testimonial.text}"</p>
                <div className="mt-5 flex items-center gap-3 border-t pt-5">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full font-semibold text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.area}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="order" className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Place your order
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Order in under 30 seconds</h2>
            <p className="mt-3 text-muted-foreground">
              Fill in your details - we'll call you to confirm and deliver.
            </p>
          </div>
          <OrderForm />
        </div>
      </section>

      <footer className="border-t py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2 font-bold">
            <img src={logo} alt="FreshMilk logo" className="h-8 w-8 object-contain" />
            FreshMilk
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            Call to order: +251 9XX XXX XXX
          </div>
          <div className="text-xs text-muted-foreground">
            (c) {new Date().getFullYear()} FreshMilk. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
