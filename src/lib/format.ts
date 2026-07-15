export function formatPrice(price: number | null, unit: string | null, priceOnRequest: boolean) {
  if (priceOnRequest || price == null) return "Price on request";
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price));
  return unit ? `${formatted} / ${unit}` : formatted;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
