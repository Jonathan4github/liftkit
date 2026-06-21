# Liftkit

**An autonomous, AI-powered A/B testing engine for product pages.**

Give Liftkit a product. It writes several versions of the page, shows different
versions to different visitors, counts who buys, keeps the winner, and then
writes new versions to try and beat that winner — on its own, forever.

> "Lift" is the term for the extra conversions an A/B test wins. That is exactly
> what this tool is built to find, again and again.

---

## Why I built this for Amboras

Amboras's headline feature is **Generative A/B Testing** — store variations that
"test themselves, forever." I wanted to prove I understand that idea by building
a small, working version of it from scratch: the AI generates the variants, the
backend runs the experiment and the statistics, and winners are promoted
automatically so the next round can begin.

This is a focused vertical slice, not a clone — built to show domain
understanding, AI integration, and real backend depth (event modeling, variant
assignment, and a significance check), rather than another CRUD app.

---

## How it works (the loop)

1. **Seed** — add a product (title, description, price, image).
2. **Generate** — Claude writes several variant versions of the page copy/price.
3. **Experiment** — each visitor is assigned a variant; we record
   `view → click → add_to_cart` events.
4. **Decide** — once a variant clears a significance threshold, it is promoted
   to be the new control.
5. **Repeat** — new challengers are generated to try and beat the winner.

---

## Tech stack

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** React
- **AI:** Claude API (Anthropic) for variant generation
- **Auth:** JWT

---

## Status

🚧 Building in the open, one small step at a time. Follow the commit history to
see the workflow.

## Roadmap

- [ ] Project setup
- [ ] Database model (products, experiments, variants, events)
- [ ] Backend API (auth, products, experiments)
- [ ] AI variant generation
- [ ] Visitor assignment + event tracking + significance check
- [ ] Frontend dashboard
- [ ] Live hosted demo with seeded data
