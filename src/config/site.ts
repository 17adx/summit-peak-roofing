export interface ServicePlan {
  id: string;
  slug: "repair" | "replacement" | "inspection";
  title: string;
  badge: string;
  price: number;
  priceLabel: string;
  planId: string;
  ctaLabel: string;
  isDeposit?: boolean;
  description: string;
  features: string[];
}

export const siteConfig = {
  company: {
    name: "Summit Peak Roofing",
    shortName: "SummitPeak",
    tagline: "Precision storm restoration & architectural roofing across Central Texas.",
    headline: "Roofs built to weather every Texas storm.",
    phone: "(512) 555-0194",
    phoneHref: "tel:+15125550194",
    email: "estimates@summitpeakroofing.com",
    address: "4800 Bee Caves Rd, Suite 200, Austin, TX 78746",
    license: "TX RCAT Licensed #049281 • Fully Insured",
    regionName: "Austin & Central Texas",
    regionSummary:
      "Local crews dispatched daily across Travis, Williamson, and Hays counties. Don't see your neighborhood? Give us a call — we likely have a truck nearby.",
  },
  whop: {
    accountId: "biz_sK74tofIX93guN",
    productId: "prod_n6bYOlZtoZDqi",
    plans: {
      inspection: "plan_hNUi35B9VhIYu",
      deposit: "plan_qTt9orp52JYDL",
      repair: "plan_Mebzl4tbqA2r6",
    },
  },
  stats: [
    { value: "3,100+", label: "Roofs Completed" },
    { value: "24–48h", label: "Inspection Turnaround" },
    { value: "25 yr", label: "Workmanship Warranty" },
    { value: "60 mi", label: "Service Radius" },
  ],
  trustBadges: [
    "Licensed & Insured",
    "25-Year Workmanship Warranty",
    "Serving Austin & Central TX",
  ],
  services: [
    {
      id: "svc-repair",
      slug: "repair",
      title: "Emergency Roof Repair",
      badge: "Flat-Rate Service",
      price: 399,
      priceLabel: "$399 flat rate",
      planId: "plan_Mebzl4tbqA2r6",
      ctaLabel: "Book Repair — $399",
      isDeposit: false,
      description:
        "Fast, permanent fixes for active leaks, blown-off shingles, pipe boots, and flashing damage before water reaches your drywall.",
      features: [
        "Same-week dispatch for active leaks",
        "Up to 1 square of shingle & flashing replacement",
        "Full digital photo report + 5-year repair warranty",
      ],
    },
    {
      id: "svc-replacement",
      slug: "replacement",
      title: "Full Roof Replacement",
      badge: "Project Deposit + Card on File",
      price: 500,
      priceLabel: "$500 project deposit",
      planId: "plan_qTt9orp52JYDL",
      ctaLabel: "Lock In Project Deposit — $500",
      isDeposit: true,
      description:
        "Complete tear-off and installation with Class 4 impact-resistant architectural shingles, synthetic underlayment, and ridge ventilation.",
      features: [
        "Locks in material pricing & priority crew date",
        "Saves card on file via Setup Intent for final invoice",
        "0% APR & monthly financing options available at checkout",
      ],
    },
    {
      id: "svc-inspection",
      slug: "inspection",
      title: "Certified Roof Inspection",
      badge: "One-Time Fee",
      price: 149,
      priceLabel: "$149 one-time",
      planId: "plan_hNUi35B9VhIYu",
      ctaLabel: "Book Inspection — $149",
      isDeposit: false,
      description:
        "45-point drone & hands-on diagnostic inspection for hail damage, real estate transactions, and insurance claim documentation.",
      features: [
        "45-point structural, flashing & shingle audit",
        "High-res drone imagery + moisture scan",
        "$149 fee credited 100% toward any replacement",
      ],
    },
  ] as ServicePlan[],
  serviceAreas: [
    "Austin",
    "Round Rock",
    "Cedar Park",
    "Georgetown",
    "Lakeway",
    "Pflugerville",
    "San Marcos",
    "Buda & Kyle",
  ],
  financingPartners: ["Klarna", "Afterpay", "Affirm", "Splitit"],
  reviews: [
    {
      quote:
        "Booked the $149 inspection online after a hail storm. They sent a full photo report the next afternoon and credited the fee toward our new roof.",
      author: "Marcus T.",
      location: "Austin, TX",
      rating: 5,
    },
    {
      quote:
        "Paying the $500 deposit through Whop took 30 seconds with Apple Pay, and when the crew finished, the final balance invoice was seamless.",
      author: "Elena R.",
      location: "Round Rock, TX",
      rating: 5,
    },
    {
      quote:
        "Had a flashing leak around our chimney during heavy rain. Fixed in one visit for the exact $399 flat rate listed on the site. Zero surprises.",
      author: "David & Sarah K.",
      location: "Cedar Park, TX",
      rating: 5,
    },
  ],
};
