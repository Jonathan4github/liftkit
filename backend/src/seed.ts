import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const DEMO_EMAIL = 'dashboard-demo@shop.com';
const DEMO_PASSWORD = 'password12';

// One challenger is a clear winner so the dashboard shows a promotable result.
// Funnel per variant: every visitor views, a fraction click, a fraction of those add to cart.
const VARIANTS = [
  {
    title: 'Wireless Earbuds',
    description: 'Crisp sound, all-day battery.',
    price: 79.0,
    isControl: true,
    views: 340,
    clickRate: 0.22,
    cartRate: 0.04,
  },
  {
    title: 'Wireless Earbuds - Free Shipping',
    description: 'Crisp sound, all-day battery. Ships free today.',
    price: 79.0,
    isControl: false,
    rationale: 'Free-shipping framing lowers the perceived total cost.',
    views: 330,
    clickRate: 0.41,
    cartRate: 0.13,
  },
  {
    title: 'Wireless Earbuds - Limited Stock',
    description: 'Crisp sound, all-day battery. Only a few left.',
    price: 84.0,
    isControl: false,
    rationale: 'Scarcity nudges hesitant buyers to act now.',
    views: 320,
    clickRate: 0.3,
    cartRate: 0.07,
  },
  {
    title: 'Premium Wireless Earbuds',
    description: 'Studio-grade sound and all-day battery.',
    price: 89.0,
    isControl: false,
    rationale: 'Premium positioning tests whether a higher price reads as quality.',
    views: 325,
    clickRate: 0.25,
    cartRate: 0.05,
  },
];

function eventsForVariant(variantId: string, slug: string, v: (typeof VARIANTS)[number]) {
  const clicks = Math.round(v.views * v.clickRate);
  const carts = Math.round(v.views * v.cartRate);
  const rows: { visitorId: string; type: 'view' | 'click' | 'add_to_cart'; variantId: string }[] = [];
  for (let i = 0; i < v.views; i++) {
    const visitorId = `${slug}-${i}`;
    rows.push({ visitorId, type: 'view', variantId });
    if (i < clicks) rows.push({ visitorId, type: 'click', variantId });
    if (i < carts) rows.push({ visitorId, type: 'add_to_cart', variantId });
  }
  return rows;
}

async function main() {
  // Idempotent: remove any previous demo data (cascades to products/experiments/variants/events).
  await prisma.merchant.deleteMany({ where: { email: DEMO_EMAIL } });

  const merchant = await prisma.merchant.create({
    data: {
      email: DEMO_EMAIL,
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
      products: {
        create: {
          title: 'Wireless Earbuds',
          description: 'Crisp sound, all-day battery.',
          price: 79.0,
          experiments: {
            create: {
              status: 'running',
              generation: 2,
              variants: {
                create: VARIANTS.map((v) => ({
                  title: v.title,
                  description: v.description,
                  price: v.price,
                  isControl: v.isControl,
                  rationale: v.rationale ?? null,
                })),
              },
            },
          },
        },
      },
    },
    include: { products: { include: { experiments: { include: { variants: true } } } } },
  });

  const variants = merchant.products[0].experiments[0].variants;
  const events = variants.flatMap((variant, idx) =>
    eventsForVariant(variant.id, `demo-v${idx}`, VARIANTS[idx]),
  );
  await prisma.event.createMany({ data: events });

  console.log(`Seeded ${DEMO_EMAIL} with ${variants.length} variants and ${events.length} events.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());