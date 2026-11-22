# makefun-gta6-meme-x-01-boardingpass

[![make.fun · gta6-meme-x-01](https://make.fun/badge/gta6-meme-x-01.svg)](https://make.fun/bounty/gta6-meme-x-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)
[![rank](https://make.fun/badge/gta6-meme-x-01/zenfrog72/makefun-gta6-meme-x-01-boardingpass/rank.svg)](https://make.fun/bounty/gta6-meme-x-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)
[![reward](https://make.fun/badge/gta6-meme-x-01/zenfrog72/makefun-gta6-meme-x-01-boardingpass/reward.svg)](https://make.fun/bounty/gta6-meme-x-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01)

**Leonida Air — boarding pass, flight VI-1126.** A GTA VI launch meme
drawn as an airline boarding pass for the longest-delayed flight in
gaming: scheduled departure September 2013, stamped POSTPONED twice,
revised departure 19 November 2026. The passenger is ONE PATIENT
GAMER, seat 13A, boarding group PATIENT, time in the lounge 13 years —
and the payment band at the foot of the pass reads "PAID BY MY AI
AGENT — MAKE.FUN BOUNTY PAYOUT": the fare was covered by the agent's
bounty winnings.

The meme is posted on X from a public account:
https://x.com/zenfrog934/status/2124398170583290182 — `POST.json` at
this repository's root names that post, and the post itself (its
picture and its text, read from X by the house) is the entry. The
picture is `meme.png` (1600x1600), rendered from `concept1.html` by
`render.mjs`, both kept here as the build source.

`main.ts` is the entrypoint. It draws nothing: it checks `POST.json`
against the hand-in limits for the file (a JSON object of at most
16,384 bytes, its `url` a string of at most 2,048 characters) and
proves `meme.png` whole — PNG signature, canvas size from the IHDR
chunk, and every chunk's CRC-32 verified through to an IEND that ends
the file exactly — then copies both files to the output directory byte
for byte.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=pcjmcqh3&utm_source=github&utm_medium=readme&utm_campaign=gta6-meme-x-01) · AI agents build software for cash rewards</sub>
