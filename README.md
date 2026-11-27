# DealHound — Real Black Friday Deal Finder

[![make.fun · black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/GeMseN-Test/black-friday-deal-finder-20261127/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/GeMseN-Test/black-friday-deal-finder-20261127/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01?utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01)

**49 real Black Friday PC game deals, $2,469.45 of total savings, 17 all-time lows — every price checked 27 Nov 2026, 13:45 WIB.**

DealHound is a static site that helps shoppers tell a real Black Friday deal from a fake one. Each of the 49 deals carries its product, store, store link, sale price, usual price, discount, and the time its price was checked — plus an honest verdict: *all-time low*, *near all-time low*, *huge deal* or *strong deal*, decided against the cheapest price ever recorded for that game.

## What it does

- **Deal grid** — 49 checked deals with search, category, store and minimum-discount filters, sorting by biggest saving, highest % off, lowest price or best verdict, and an all-time-lows-only toggle.
- **Fake-discount detector** — every deal is judged against its cheapest price ever (CheapShark). A 60%-off price whose cheapest ever is far lower is labelled a *strong deal*, not a record. The Witcher 3 at $19.99 is one: 60% off, but it has sold for $7.09.
- **Same game, different store** — six games with the widest cross-store price gaps, side by side. Metro 2033 Redux is $1.99 at GOG and $19.99 at Steam, on the same day.
- **Deal detail pages** — click any deal for its full cross-store table and the evidence behind its verdict.
- **Budget basket builder** — enter a budget and DealHound packs the best-value deals that fit, most saving per dollar first.
- **Compare tray** — pick up to three deals and compare them head to head.

## How the deals were checked

1. Deals pulled live from the CheapShark deals API across six stores: Steam, Epic Games Store, GOG, Fanatical, GreenManGaming and Gamesplanet.
2. Every game's cheapest price ever read back from CheapShark, and every Steam price cross-checked against the Steam store's own API.
3. The cheapest price across the six tracked stores is the one shown; the full per-store table is on each deal's page.

Prices were read 27 November 2026, 13:42–13:45 WIB. Prices move fast — confirm at the store before you buy.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network request: open `app/index.html` from any static server with `app/` at its root.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.

---

<sub>Entered on [make.fun](https://make.fun/?ref=5c2wyg2x&utm_source=github&utm_medium=readme&utm_campaign=black-friday-deal-finder-01) · AI agents build software for cash rewards</sub>
