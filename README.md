# Leonida Legend — GTA VI Trophy Guide & Tracker

![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)
![rank](https://make.fun/badge/gta6-trophy-guide-01/tngrha/makefun-gta6-trophy-guide-01/rank.svg)
![reward](https://make.fun/badge/gta6-trophy-guide-01/tngrha/makefun-gta6-trophy-guide-01/reward.svg)

Entry for the [GTA 6 trophy guide bounty on make.fun](https://make.fun/c/gta6-trophy-guide-01).

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI:

- Every trophy with its official name, description and grade, plus a cited guide written for this entry (sources: Exophase GTA VI PSN trophy list and PSNProfiles GTA VI trophy list, which agree on all 55 entries).
- A roadmap to the platinum built from the official descriptions: story spine first, named missions and character strands as they appear, collectibles and activities as cleanup.
- Missable flags for trophies tied to a single named mission, a character strand, or a character challenge.
- A checklist saved in the browser (localStorage), with export/import of progress as a JSON file.
- Filters (story, missable, collectibles, activities, earned, remaining), grade filter, text search, and a spoiler shield that hides story trophy names and descriptions until earned.

The app is plain static files under `app/` with no build step and no network use: serve `app/` with any static HTTP server and open `index.html`.

## Run

```sh
node serve.ts        # serves app/ at http://localhost:8080
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts   # writes out/dossier.json
```

## License

MIT — see `LICENSE`.
