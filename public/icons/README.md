# Store badge icons

Drop the official store badges here with these exact filenames:

| File                      | Source                                                                     |
|---------------------------|----------------------------------------------------------------------------|
| `app-store-badge.svg`     | https://developer.apple.com/app-store/marketing/guidelines/                |
| `google-play-badge.svg`   | https://play.google.com/intl/en_us/badges/                                 |

`components/StoreBadges.tsx` references these paths directly:

```
/icons/app-store-badge.svg
/icons/google-play-badge.svg
```

Until you paste them, the badges will 404 — the alt text falls through so screen
readers still announce the buttons, but you'll see a missing-image icon.

## Honest notes

- Apple's brand guidelines require the badge be at least 40 px tall and
  surrounded by clear space equal to 1/10 the badge height.
- Google's badge must be at least 60 px tall.
- Don't recolor or rotate either badge — both vendors will reject store
  submissions that modify their artwork.
