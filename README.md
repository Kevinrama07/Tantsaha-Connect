# Tantsaha (Monorepo)

This repository has been reorganized into a simple monorepo with separate `client/` (React + Vite) and `server/` (Node/Express) packages.

## Quick start

- Install dependencies from repository root:

  npm install

- Development (start both server and client concurrently):

  npm run dev

- Start server only:

  npm run server:start

- Start client only (Vite):

  npm run client:dev

- Build client:

  npm run client:build

---

For details about the frontend or backend, see the `client/` and `server/` folders respectively.

---

Migration notes:
- Frontend files were moved to `client/src/` and `client/public/`.
- Backend remains in `server/` unchanged.
- Run `npm install` at repo root to install `concurrently` and keep using existing `npm install` in `client/` and `server/` if you prefer separate installs.

If you want, I can also:
- Add a root-level CI workflow that runs lint and build for `client` and `server`.
- Remove or archive the legacy top-level frontend files I copied from (I left them in place for now to avoid accidental data loss).