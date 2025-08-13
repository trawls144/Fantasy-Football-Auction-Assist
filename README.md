# Auctioneer - Fantasy Football Auction Draft Tool

A comprehensive web application for managing fantasy football auction drafts, built with Next.js 14, TypeScript, and Supabase. Track your budget, manage your roster, analyze tier-based strategies, and optimize your draft with AI-powered roster scenarios.

[Live Demo Here](https://fantasy-football-auction-assist.vercel.app/)

## ✨ Features

### 🎯 Core Draft Management
- **Real-time Budget Tracking** - Monitor your remaining budget and average per slot
- **Player Search & Selection** - Fast autocomplete search with tier and ranking data
- **Roster Management** - Track your drafted players across all positions
- **Target Player Lists** - Mark and prioritize players you want to target
- **Drafted Player Tracking** - Keep track of players drafted by other teams

### 📊 Advanced Analytics
- **Tier-Based Player Rankings** - Visual tier system for easy player evaluation
- **Position Rankings** - See where players rank within their position
- **Budget Allocation Strategies** - Three pre-built roster construction approaches
- **Roster Scenario Planning** - AI-powered optimization for remaining picks

### 🏆 Roster Scenarios (AI-Powered)
The app includes three strategic approaches to roster construction:

1. **Balanced Build** - Even budget distribution across all positions
2. **Stars & Scrubs** - Target 2-3 elite players, fill with value picks  
3. **Depth Strategy** - No single player over $35, build deep bench

Each scenario dynamically updates based on your current roster and remaining budget, showing optimal player targets and budget allocation.

### 📈 Data Management
- **CSV Import Support** - Bulk update player data from Beer Sheet or other sources
- **Real-time Sync** - All data synced across devices via Supabase
- **Position Flexibility** - Handles FLEX positions and bench management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Supabase account
- Git

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd auctioneer
npm install
```

### 2. Set Up Supabase

#### Create a New Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned
3. Go to Settings → API to find your project URL and anon key

#### Set Up the Database
1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase-schema.sql` from this repository
3. Paste and run the SQL to create all tables, indexes, and sample data

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the values with your actual Supabase project URL and anon key from step 2.

### 4. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using the app!

## 📊 Adding Your Own Player Data

The app comes with sample data, but you'll want to add current season players and rankings.

### Method 1: CSV Import (Recommended)
1. Prepare a CSV file with columns: `tier`, `PLAYER NAME`, `position_rank`
   - `tier`: Player tier (1-15, lower is better)
   - `PLAYER NAME`: Full player name (must match existing database)
   - `position_rank`: Position + rank (e.g., "QB1", "RB15", "WR8")

2. Place the CSV file in your project root

3. Run the import script:
```bash
node update-players-from-csv.js
```

The script will:
- Parse your CSV data
- Match players by name (case-insensitive)
- Update tier and position_rank fields
- Show a summary of successful updates and players not found

### Method 2: Direct Database Insert
1. Go to your Supabase dashboard → Table Editor → players
2. Insert player records with these required fields:
   - `name`: Player's full name
   - `position`: QB, RB, WR, TE, K, or DEF
   - `team`: NFL team abbreviation (optional)
   - `cost_value`: Projected auction value
   - `tier`: Player tier (1-15)
   - `position_rank`: Numerical rank within position

### Method 3: SQL Bulk Insert
```sql
INSERT INTO players (name, position, team, cost_value, tier, position_rank) VALUES
('Player Name', 'RB', 'KC', 45.00, 2, 8),
-- Add more players...
```

## 🏗️ System Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (ready for multi-user)

### Database Schema
The app uses 4 main tables:

1. **`players`** - All available players with valuations and rankings
2. **`user_rosters`** - Tracks your drafted players and purchase prices
3. **`targets`** - Your target player list with priorities
4. **`draft_status`** - Tracks which players have been drafted league-wide

### Component Architecture
```
src/
├── app/                 # Next.js App Router
├── components/          # React components
│   ├── ui/             # Shadcn/ui components
│   ├── BudgetTracker   # Budget display
│   ├── PlayerSearch    # Autocomplete search
│   ├── PlayerDisplay   # Selected player details
│   ├── RosterTable     # Current roster
│   ├── RosterScenarios # AI-powered optimization
│   ├── TargetsList     # Target players
│   └── Tiers          # Tier-based rankings
├── hooks/              # Custom React hooks
├── lib/                # Utilities and Supabase client
└── types/              # TypeScript definitions
```

## 🎮 How to Use

### Basic Draft Flow
1. **Search for a player** using the autocomplete search
2. **Review player details** including tier, rank, and projected value
3. **Set your bid** and mark as drafted when won, or mark as "drafted by other"
4. **Track your budget** and remaining roster needs
5. **Use target list** to track players you want to target later

### Roster Scenarios
The Roster Scenarios section provides AI-powered optimization:

- **Real-time Updates**: Scenarios update based on your current roster and budget
- **Strategic Guidance**: Each scenario provides specific strategy recommendations
- **Budget Allocation**: See optimal spending per position
- **Player Suggestions**: View potential players for each roster slot
- **Tier Prioritization**: Algorithm prioritizes better tier players within budget constraints

### Advanced Features
- **Tier Visualization**: Color-coded tiers help identify value picks
- **Position Flexibility**: Handles FLEX positions automatically
- **Draft History**: Track when players were drafted and by whom

## 🔧 Configuration

### Budget Settings
Default budget is $200. To change:
1. Edit `src/app/page.tsx`
2. Update the `totalBudget` state value (line 47)

### Roster Structure
Default roster has 14 slots. To modify:
1. Edit `initialRoster` array in `src/app/page.tsx` (lines 28-43)
2. Update position requirements in `RosterScenarios.tsx` (lines 140-149)

### Adding New Roster Scenarios
1. Edit `src/components/RosterScenarios.tsx`
2. Add new scenario to `defaultScenarios` array
3. Include strategy logic in `buildScenarioRoster` function

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🐛 Troubleshooting

### Common Issues

**"Failed to connect to Supabase"**
- Verify your `.env.local` file has correct Supabase URL and key
- Check that your Supabase project is active
- Ensure environment variables are properly formatted

**"Players not found during CSV import"**
- Player names in CSV must exactly match database names
- Check for extra spaces, different spellings, or special characters
- Use the import script's output to see which players weren't found

**"Build/Lint errors"**
- Run `npm run lint` to check for TypeScript errors
- Ensure all imports are correct
- Check that all required environment variables are set




---

Built with ❤️ for fantasy football enthusiasts. May your auction drafts be ever in your favor! 🏆
