# RN Expo Template

## Overview

A reusable Expo SDK 54, React Native, and TypeScript starter with a scalable project structure and working placeholder session flow. It provides generic foundations that can be adapted for future applications without app-specific branding or optional integrations.

## Included

- Expo and TypeScript
- React Navigation
- Theme tokens and common UI components
- Zustand with AsyncStorage persistence
- SecureStore for sensitive session values
- Axios and React Query
- React Hook Form and Zod
- Generic session and navigation architecture
- Environment configuration
- Interactive project setup script

## Creating a New Project

When using GitHub's **Use this template** feature, first create a new repository from the template and then clone that newly generated repository. Do not clone this template repository and develop a product directly inside it.

From the new project's directory, run:

```bash
npm install
npm run setup
npx expo start
```

Then configure the environment if needed and replace the generic icons, splash image, and other assets.

## Setup Script

`npm run setup` asks for:

- App display name
- Expo slug
- iOS bundle identifier
- Android package

It updates the relevant Expo, npm, lockfile, and runtime app-name configuration. It does not rename the repository or project directory, create Firebase projects, create Google or Apple developer applications, or configure optional modules.

## Environment

If the application uses an API, create the local environment file with:

```bash
cp .env.example .env
```

Set `EXPO_PUBLIC_API_BASE_URL` in `.env`. Values prefixed with `EXPO_PUBLIC_` are embedded in the client application and are visible to users, so they must never contain secrets or private credentials.

## Demo Authentication

The Welcome and Home screens demonstrate navigation and session restoration with the non-secret `template-demo-token` placeholder. Replace this demo sign-in with the new project's real login API or authentication provider before release.

## Architecture

```text
src/
├── api/                  # HTTP client and API error normalization
├── components/common/    # Reusable UI primitives
├── constants/            # Runtime config, storage keys, and font names
├── hooks/                # Reusable application hooks
├── navigation/           # Root, auth, and main navigation
├── screens/              # Route-level auth and main screens
├── services/             # Query client and storage adapters
├── store/                # Zustand application and auth state
├── theme/                # Design tokens
├── types/                # Shared TypeScript and form types
└── utils/                # Generic validation and helpers
```

## Optional Modules

Firebase, notifications, analytics, maps, media, payments, and similar product-specific integrations are intentionally not included. Add them only when a project requires them.

## Common Commands

```bash
npm start
npm run android
npm run ios
npx tsc --noEmit
npx expo-doctor
```
