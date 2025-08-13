# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev` - Runs Next.js in development mode on localhost:3000
- **Build**: `npm run build` - Creates production build
- **Start production**: `npm start` - Starts production server
- **Lint**: `npm run lint` - Runs ESLint via Next.js linter

## Project Architecture

This is a Next.js 14 fantasy football auction draft tool using:

### Core Technologies
- **Next.js 14** with App Router (`src/app/`)
- **TypeScript** with strict mode enabled
- **Supabase** for database (PostgreSQL)
- **Shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** for styling

### Database Schema
The application uses 4 main Supabase tables defined in `supabase-schema.sql`:
- `players` - All available players with valuations and projections
- `user_rosters` - Tracks drafted players and their purchase prices
- `targets` - User's target player list with priorities
- `draft_status` - Tracks which players have been drafted

### Component Architecture
- **Main page**: `src/app/page.tsx` - Central state management and layout
- **Core components**: All in `src/components/`
  - `BudgetTracker` - Budget display and remaining funds calculation
  - `PlayerSearch` - Autocomplete search using Command component
  - `PlayerDisplay` - Shows selected player details and draft actions
  - `RosterSidebar` - Current roster composition
  - `TargetsList` - User's target players management
  - `RosterScenarios` - AI-powered roster optimization (planned)
- **UI components**: `src/components/ui/` - Shadcn/ui components

### Key Files
- `src/types/database.ts` - TypeScript interfaces for all database entities
- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/utils.ts` - Utility functions (Tailwind merge, etc.)
- `components.json` - Shadcn/ui configuration
- `tailwind.config.js` - Tailwind CSS configuration with custom theme

### State Management
- React Context/useState pattern in main page component
- Local state for budget tracking, roster management, and target players
- Mock data in `PlayerSearch.tsx` (needs to be connected to Supabase)

### Configuration
- Path aliases: `@/*` maps to `./src/*`
- Starting budget: $200 (configurable in `src/app/page.tsx:48`)
- Roster structure: 16 slots including QB, RB, WR, TE, FLEX, K, DEF, BENCH (configurable in `src/app/page.tsx:26-43`)

### Environment Setup
Requires `.env.local` with:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Current Status
- UI and state management implemented
- Database schema created
- Mock player data in use (needs Supabase integration)
- Roster scenarios component placeholder exists