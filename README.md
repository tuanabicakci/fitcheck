# Fit Check

A mobile closet app built with Expo and React Native. Photograph your
clothes, build outfits from them, and get a daily outfit idea based on the
weather — all with a Y2K-inspired UI and no login screen.

## Features

- **Digital closet** — add clothing items by photo, organized by category
  (tops, bottoms, shoes, jackets, bags, jewelry, hats, belts, accessories).
- **Background removal** — optionally cut items out of their photos via the
  remove.bg API for a clean, catalog-style look.
- **Outfit builder** — assemble outfits from your closet items, save them,
  and mark favorites.
- **Weather-aware suggestions** — pulls local weather to help pick what to
  wear that day.
- **Zero-friction accounts** — every install gets a silent, anonymous
  Supabase account. No sign-up flow, no password.

## Tech stack

- [Expo](https://expo.dev) / [Expo Router](https://docs.expo.dev/router/introduction/) (file-based routing)
- React Native + TypeScript
- [Supabase](https://supabase.com) (Postgres, Storage, anonymous auth, row-level security)
- [NativeWind](https://www.nativewind.dev/) (Tailwind for React Native)
- [Reanimated](https://docs.swmansion.com/react-native-reanimated/) for gesture-driven UI

## Getting started

```bash
npm install
cp .env.example .env   # then fill in your Supabase project (see below)
npx expo start
```

From the Expo CLI output you can launch the app in a development build, an
Android emulator, an iOS simulator, or [Expo Go](https://expo.dev/go).

### Backend setup

Fit Check needs a Supabase project to store closet items and outfits. Full
setup steps — schema, storage bucket, anonymous auth, and the optional
remove.bg key — are in [`supabase/README.md`](supabase/README.md).

## Project structure

```
src/
  app/          screens, using Expo Router's file-based routing
  components/   shared UI, including the y2k/ design-system primitives
  lib/          data layer: Supabase client, store, mappers, types
supabase/
  migrations/   SQL schema (RLS-scoped closet_items and outfits tables)
```

## License

MIT — see [LICENSE](LICENSE).
