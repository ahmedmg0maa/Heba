# Repository execution guide

## Source of truth
- Continue the owner-approved rebuild in `D:/HEBA_ELSherif_CODEX_MASTER_EXECUTION_PROMPT.md` in phase order.
- Read `docs/PROJECT_STATE.md` before changing code. Update it after each meaningful slice and at every phase boundary.
- Treat `docs/DECISIONS.md` as append-only. Record architectural or security decisions there.

## Non-negotiable rules
- Arabic-first, RTL, accessible, responsive, and light/dark compatible.
- No fake admin controls: every create/edit/delete/publish/approve action must persist, be permission-checked server-side, validated, audited, and return clear feedback.
- Never expose or print service-role credentials. `.env` and `supabase/.temp` are local-only. Use `.env.example` for names, never values.
- Preserve existing data and unrelated worktree changes. Use additive migrations and reversible UI changes.
- Run the checks documented in `docs/TESTING.md`; create release archives only with `pnpm package:release`.

## Continuation protocol
1. Confirm the current phase and exact next task in `docs/PROJECT_STATE.md`.
2. Inspect existing implementation before adding a parallel abstraction.
3. Implement the smallest complete vertical slice, including migration/RLS, server action, UI, audit log, and tests where applicable.
4. Update documentation and the checkpoint, then continue automatically unless a real external blocker exists.
