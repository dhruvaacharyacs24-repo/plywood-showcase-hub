import logoAsset from "@/assets/logo.png.asset.json";

export const SITE = {
  name: "Aashlesha Enterprises",
  tagline: "Our promise, Your Trust!",
  description:
    "Wholesale & retail supplier of premium plywood, plastics, tarpaulins and interior design materials.",
  logo: logoAsset.url,
  phone: "+91 00000 00000",
  whatsapp: "+91 00000 00000",
  email: "sales@aashleshaenterprises.com",
  address: "Please add your business address in src/lib/site.ts",
  mapEmbed:
    "https://www.google.com/maps?q=Mumbai&output=embed",
  social: {
    facebook: "#",
    instagram: "#",
    linkedin: "#",
  },
} as const;

export function whatsappLink(text?: string) {
  const num = SITE.whatsapp.replace(/[^\d]/g, "");
  return `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function telLink() {
  return `tel:${SITE.phone.replace(/\s/g, "")}`;
}
