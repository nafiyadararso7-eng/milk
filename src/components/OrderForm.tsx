import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitOrder } from "@/utils/orders.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Loader2, CheckCircle2, Phone, User } from "lucide-react";

const QUANTITIES = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const PRICE_PER_LITER = 100;

// Format a Nominatim address object into "Area, City" style
function formatPlace(addr: Record<string, string> | undefined, displayName?: string): string {
  if (!addr) return displayName ?? "";
  const area =
    addr.suburb ||
    addr.neighbourhood ||
    addr.quarter ||
    addr.city_district ||
    addr.village ||
    addr.town ||
    addr.hamlet ||
    addr.road ||
    "";
  const city = addr.city || addr.town || addr.state || "";
  if (area && city && area !== city) return `${area}, ${city}`;
  if (area) return area;
  if (city) return city;
  return displayName ?? "";
}

type Suggestion = { label: string; displayName: string };

export function OrderForm() {
  const submit = useServerFn(submitOrder);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [searching, setSearching] = useState(false);

  const price = useMemo(() => Math.round(quantity * PRICE_PER_LITER), [quantity]);

  // Live search Ethiopian places as the user types (Nominatim, no API key)
  useEffect(() => {
    const q = location.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }
    if (suggestions.some((s) => s.label === location)) return;

    const controller = new AbortController();
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=et&limit=6&q=${encodeURIComponent(q)}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": "en" },
        });
        if (!res.ok) throw new Error("search failed");
        const data: Array<{ display_name: string; address: Record<string, string> }> =
          await res.json();
        const seen = new Set<string>();
        const items: Suggestion[] = [];
        for (const d of data) {
          const label = formatPlace(d.address, d.display_name);
          if (!label || seen.has(label)) continue;
          seen.add(label);
          items.push({ label, displayName: d.display_name });
        }
        setSuggestions(items);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(false), 4500);
    return () => clearTimeout(t);
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter your name");
    if (!phone.trim() || phone.trim().length < 7)
      return toast.error("Please enter a valid phone number");
    if (!location.trim()) return toast.error("Please provide your location");

    setSubmitting(true);
    try {
      await submit({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          quantity,
          price,
          location: location.trim(),
          locationType: "manual",
        },
      });
      setSuccess(true);
      setName("");
      setPhone("");
      setQuantity(1);
      setLocation("");
    } catch (err) {
      console.error(err);
      toast.error("Could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border bg-card p-6 sm:p-8 md:p-10 shadow-[var(--shadow-elegant)]"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                maxLength={100}
                className="h-12 pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium">
              Phone Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 9XX XXX XXX"
                required
                maxLength={30}
                className="h-12 pl-10"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-sm font-medium">
              Quantity
            </Label>
            <Select
              value={String(quantity)}
              onValueChange={(v) => setQuantity(Number(v))}
            >
              <SelectTrigger id="quantity" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUANTITIES.map((q) => (
                  <SelectItem key={q} value={String(q)}>
                    {q} Liter{q !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Total Price</Label>
            <div
              className="h-12 flex items-center justify-between rounded-md px-4 text-primary-foreground font-semibold"
              style={{ background: "var(--gradient-primary)" }}
            >
              <span className="text-sm opacity-90">{quantity} L × 100 Birr</span>
              <span className="text-xl tabular-nums">{price} Birr</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Label htmlFor="location" className="text-sm font-medium">
            Delivery Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Type your area, e.g. Bole"
              className="h-12 pl-10"
              maxLength={500}
              required
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s.displayName}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setLocation(s.label);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-accent flex items-center gap-2"
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          size="lg"
          className="mt-7 w-full h-14 text-base font-semibold"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Placing order...
            </>
          ) : (
            `Place Order — ${price} Birr`
          )}
        </Button>

        <p className="mt-3 text-xs text-center text-muted-foreground">
          No account needed. We'll call you to confirm delivery.
        </p>
      </form>

      {success && <SuccessOverlay onClose={() => setSuccess(false)} />}
    </div>
  );
}

function SuccessOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 animate-fade-up"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-3xl p-8 sm:p-10 max-w-sm w-full text-center shadow-[var(--shadow-elegant)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mb-5">
          <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={2.5} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Order Sent!</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Your order has been sent successfully. We will call you shortly to confirm delivery.
        </p>
        <Button onClick={onClose} className="mt-6 w-full h-12">
          Got it
        </Button>
      </div>
    </div>
  );
}
