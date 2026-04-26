import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MapPin, Loader2, CheckCircle2, Phone, User } from "lucide-react";
import { toast } from "sonner";
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

const QUANTITIES = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const PRICE_PER_LITER = 100;

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

type Suggestion = {
  label: string;
  displayName: string;
};

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

  useEffect(() => {
    const q = location.trim();

    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    if (suggestions.some((suggestion) => suggestion.label === location)) return;

    const controller = new AbortController();
    setSearching(true);

    const timeoutId = setTimeout(async () => {
      try {
        const url =
          "https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&countrycodes=et&limit=6&q=" +
          encodeURIComponent(q);
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": "en" },
        });

        if (!response.ok) throw new Error("search failed");

        const data: Array<{ display_name: string; address: Record<string, string> }> =
          await response.json();
        const seen = new Set<string>();
        const items: Suggestion[] = [];

        for (const result of data) {
          const label = formatPlace(result.address, result.display_name);
          if (!label || seen.has(label)) continue;

          seen.add(label);
          items.push({ label, displayName: result.display_name });
        }

        setSuggestions(items);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSuggestions([]);
        }
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  useEffect(() => {
    if (!success) return;

    const timeoutId = setTimeout(() => setSuccess(false), 4500);
    return () => clearTimeout(timeoutId);
  }, [success]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!name.trim()) return toast.error("Please enter your name");
    if (!phone.trim() || phone.trim().length < 7) {
      return toast.error("Please enter a valid phone number");
    }
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
    } catch (error) {
      console.error(error);
      toast.error("Could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border bg-card p-6 shadow-[var(--shadow-elegant)] sm:p-8 md:p-10"
        style={{ background: "var(--gradient-card)" }}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
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
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
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
            <Select value={String(quantity)} onValueChange={(value) => setQuantity(Number(value))}>
              <SelectTrigger id="quantity" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUANTITIES.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} Liter{option !== 1 ? "s" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Total Price</Label>
            <div
              className="flex h-12 items-center justify-between rounded-md px-4 font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <span className="text-sm opacity-90">{quantity} L x 100 Birr</span>
              <span className="text-xl tabular-nums">{price} Birr</span>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <Label htmlFor="location" className="text-sm font-medium">
            Delivery Location
          </Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="location"
              value={location}
              onChange={(event) => {
                setLocation(event.target.value);
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
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border bg-popover shadow-lg">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion.displayName}
                    type="button"
                    onMouseDown={(event) => {
                      event.preventDefault();
                      setLocation(suggestion.label);
                      setShowSuggestions(false);
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-accent"
                  >
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{suggestion.label}</span>
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
          className="mt-7 h-14 w-full text-base font-semibold"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
        >
          {submitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Placing order...
            </>
          ) : (
            `Place Order - ${price} Birr`
          )}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-card p-8 text-center shadow-[var(--shadow-elegant)] animate-scale-in sm:p-10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
          <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={2.5} />
        </div>
        <h3 className="mb-2 text-2xl font-bold">Order Sent!</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Your order has been sent successfully. We will call you shortly to confirm delivery.
        </p>
        <Button onClick={onClose} className="mt-6 h-12 w-full">
          Got it
        </Button>
      </div>
    </div>
  );
}
