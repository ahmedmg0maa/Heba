# KNOWN ISSUES

| # | Severity | Issue | Status |
|---|----------|-------|--------|
| 1 | medium | `/public/brand/` assets missing (logo.svg, portrait-*.jpg, floral-*.png/svg, product photos). Using refined CSS/SVG ornamental substitutes in brand colors — awaiting real assets. | open |
| 2 | low | The 4 reference screenshots (S1–S4) were described in the master plan but not attached to the session. Building from the detailed §2 written specs; request the actual images for the V1.6.0 visual polish pass. | open |
| 3 | medium | Order auto-expiry: `expire_stale_orders()` added in migration 011; schedule it via pg_cron (instructions in the migration) when the Supabase project is provisioned. | mitigated |
| 4 | low | Next 16 deprecation warning: "middleware" file convention → rename to "proxy" during V1.9.0 hardening. | open |
