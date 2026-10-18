# Contributing

Thanks for wanting to help. Contributions go through
[GitHub](https://github.com/kzzzld/geography-game) — open an issue or send a pull
request. Patches by email are also welcome if you prefer that. This page covers
code style and the workflow.

## Ground rules

- **No frameworks.** The app is plain ES modules plus CSS, bundled by Vite.
  Keep it that way.
- **Keep it small and clear.** No bloat — write the simplest thing that works,
  prefer clarity over cleverness, and avoid unnecessary abstractions, helpers,
  or dependencies.
- **No comments** in the source unless they clarify something genuinely
  non-obvious. Section banners (`// ===== Name =====`) are the accepted
  exception.
- **Every user-visible string** must come from a locale file and be read through
  `t(...)`. Adding a hard-coded English string is a bug. See
  [Localization](Localization.md).
- **Follow the existing patterns.** Persisted settings use the
  `apply*`/`load*` pair; `localStorage` keys use the `flag-quiz-` prefix; the
  command line gains a new command by adding a `case` and a
  `COMMAND_NAMES` entry.
- **Keep patches focused.** One logical change per patch.
- **Commit every logical change** as soon as it's done, and never commit
  secrets.

## Commit messages

The repository uses [Conventional Commits](https://www.conventionalcommits.org/)-
style subjects, e.g.:

```
feat: add map guessing quiz mode
fix: sync mode buttons when gamemode changes from command line
docs: add Nix usage and NixOS hosting section
chore: add untested Docker and Compose setup
```

Use `feat`, `fix`, `docs`, `chore`, `refactor`, or `test` as appropriate, and
write the subject in the imperative mood.

## Submitting a change

1. Fork the repository and create a branch for your change.
2. Commit your work (see [Commit messages](#commit-messages)).
3. Open a pull request against the default branch.

Keep one logical change per pull request, and make sure `npm run build` passes.

### By email instead

If you'd rather not use GitHub, send a patch with
[`git send-email`](https://git-send-email.io/):

```bash
git send-email --to=kzzzl@kzzzl.xyz --subject-prefix="PATCH geography-game" origin/main..HEAD
```

Or make a patch file with plain git and attach it to an email:

```bash
git format-patch -1 --stdout > 0001-my-change.patch
```

Send it to **kzzzl@kzzzl.xyz**. The commit subject line becomes the email
subject.

#### Multiple commits

For a series, send the range (e.g. `origin/main..HEAD`) with `git send-email`
and it will number the patches. Keep each one buildable and focused.

## Before you submit

- `npm run build` succeeds.
- If you changed `public/data.json`, the JSON is valid and every new entry has
  `country`, `flag`, `type`, and `capital`.
- If you added a string, it exists in `locales/en.json` (at minimum) and is used
  via `t(...)`.
- No stray `console.log` or commented-out code.

Related: [Architecture](Architecture.md) · [Project Structure](Project-Structure.md)
