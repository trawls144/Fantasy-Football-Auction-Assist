# Fantasy Football Auction Draft Tool PRD

## Executive Summary

This Product Requirements Document outlines the development of a real-time fantasy football auction draft assistant tool. The tool will help users make optimal bidding decisions during their draft by displaying player costs, tracking budget, managing rosters, and suggesting optimal team combinations based on remaining budget and available players.

## Background & Objectives

### Problem Statement
Fantasy football auction drafts require rapid decision-making with limited time to evaluate player values, track spending, and plan roster construction. Users need a tool that provides instant access to player valuations, tracks their budget in real-time, and suggests optimal roster combinations as the draft progresses.

### Key Objectives
1. Provide instant access to player cost valuations during the auction
2. Track user's budget and roster in real-time
3. Suggest optimal roster scenarios based on remaining budget and available players
4. Enable quick player search and selection
5. Identify and highlight targeted players

## Technical Requirements

### Tech Stack
- **Frontend Framework**: Next.js 14+ with App Router
- **Database**: Supabase (PostgreSQL)
- **UI Components**: Shadcn/ui
- **Styling**: Tailwind CSS
- **Search**: Next.js with Shadcn Command component for autocomplete
- **State Management**: React Context or Zustand
- **Data Fetching**: React Query or SWR for Supabase integration

### External APIs (Nice to have)
- ESPN Fantasy API (if available)
- NFL official stats API
- Fantasy football projection APIs

## Core Features

### 1. Player Search & Selection
- **Autocomplete Search Field**: 
  - Uses Shadcn Command component
  - Searches through all available players
  - Shows player name, position, team, and cost
  - Keyboard navigation support
  - Filters by position, team, or name

### 2. Player Display
When a player is selected:
- **Large Central Display**:
  - Player name and team
  - Position
  - **Cost value** (prominently displayed)
  - Average auction value (AAV)
  - Value indicator (positive/negative compared to cost)
  - Target indicator if player is on target list
  - Last week's points (if available)
  - Season projections

### 3. Draft Action Interface
- **"Drafted" Section**:
  - Two buttons: "Yes" and "No"
  - If "Yes" is selected:
    - Input field appears for purchase price
    - Validates price doesn't exceed remaining budget
    - Adds player to user's roster
    - Updates budget
  - If "No" is selected:
    - Marks player as drafted by another team
    - Removes from available player pool

### 4. Budget Tracker
- **Top of UI Budget Box**:
  - Starting budget: $200
  - Current budget: Dynamically updated
  - Spent amount
  - Average per remaining roster spot
  - Visual progress bar

### 5. Roster Management (Right Sidebar)
- **"My Team" Section**:
  - Organized by position based on league settings:
    - QB: 1 slot
    - RB: 2 slots
    - WR: 3 slots
    - TE: 1 slot
    - FLEX: 1 slot (RB/WR/TE)
    - K: 1 slot
    - DEF: 1 slot
    - Bench: 6 slots
  - Shows drafted players with purchase price
  - Calculates total projected points
  - Indicates empty slots

### 6. Target Players (Bottom Section)
- **Target List**:
  - Pre-draft custom list of targeted players
  - Shows player name, position, and cost value
  - Visual indicator when viewing a targeted player
  - Strike-through when player is drafted
  - Quick-select to view player details
  - Ability to add/remove targets

### 7. Roster Scenarios (Dynamic Optimization)
- **"Optimal Rosters" Section**:
  - Shows 3 potential roster combinations
  - Based on:
    - Remaining budget
    - Available players
    - Position needs
    - Value optimization algorithm
  - Each scenario shows:
    - Total projected points
    - Key players to target
    - Position allocation strategy
    - Budget distribution
  - Updates after each pick

## Data Schema

### Players Table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(10) NOT NULL,
  team VARCHAR(10),
  cost_value DECIMAL(5,2) NOT NULL,
  average_auction_value DECIMAL(5,2),
  projected_points DECIMAL(5,1),
  last_week_points DECIMAL(5,1),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### User Rosters Table
```sql
CREATE TABLE user_rosters (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES players(id),
  purchase_price DECIMAL(5,2) NOT NULL,
  roster_position VARCHAR(10),
  drafted_at TIMESTAMP DEFAULT NOW()
);
```

### Targets Table
```sql
CREATE TABLE targets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  player_id UUID REFERENCES players(id),
  priority INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Draft Status Table
```sql
CREATE TABLE draft_status (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  is_drafted BOOLEAN DEFAULT FALSE,
  drafted_by_user BOOLEAN DEFAULT FALSE,
  drafted_at TIMESTAMP
);
```

## User Interface Design

### Layout Structure
```
+----------------------------------------------------------+
|                    BUDGET: $142 / $200                    |
+------------------+------------------------+--------------+
|                  |                        |              |
|  PLAYER SEARCH   |    CURRENT PLAYER      |   MY TEAM    |
|  [___________]   |                        |              |
|                  |    Patrick Mahomes     | QB: ______   |
|                  |    KC - QB              | RB: ______   |
|                  |                        | RB: ______   |
|                  |    COST: $42           | WR: ______   |
|                  |    (AAV: $45)          | WR: ______   |
|                  |                        | WR: ______   |
|                  |    ⭐ TARGET PLAYER     | TE: ______   |
|                  |                        | FLX: _____   |
|                  |    DRAFTED?            | K: _______   |
|                  |    [YES] [NO]          | DEF: _____   |
|                  |    Price: [____]       |              |
|                  |                        | BENCH:       |
+------------------+------------------------+ _________    |
|                                           | _________    |
|              TARGETS                      | _________    |
|  1. C. McCaffrey (RB) - $58             | _________    |
|  2. T. Hill (WR) - $48                  | _________    |
|  3. M. Andrews (TE) - $24               | _________    |
|                                           |              |
+-------------------------------------------+--------------+
|                                                          |
|                   ROSTER SCENARIOS                       |
|  Scenario 1 (165 pts): Balanced                         |
|  - Spend $35-40 on QB, $80-90 on RBs...                |
|                                                          |
|  Scenario 2 (168 pts): Stars & Scrubs                   |
|  - Get 2 elite players, fill with $1-3 values...        |
|                                                          |
|  Scenario 3 (162 pts): Depth Build                      |
|  - No player over $35, strong bench...                  |
|                                                          |
+----------------------------------------------------------+
```

## Optimization Algorithm

### Value Calculation
Based on the uploaded draft sheet guidance:
- **COST** represents the maximum price to pay for positive value
- Calculate value as: `(Projected Points - Replacement Level) / Dollar`
- Replacement level based on worst starter at each position

### Roster Optimization Strategy
1. **Position Allocation** (typical $200 budget):
   - QB: 5-10% ($10-20)
   - RB: 35-45% ($70-90)
   - WR: 35-45% ($70-90)
   - TE: 5-15% ($10-30)
   - K: 0.5% ($1)
   - DEF: 0.5-2% ($1-4)
   - Bench: 5-10% ($10-20)

2. **Optimization Constraints**:
   - Must fill all starting positions
   - Cannot exceed budget
   - Maximize projected starter points
   - Maintain bench budget for depth

3. **Scenario Generation**:
   - **Balanced**: Even distribution across positions
   - **Stars & Scrubs**: 2-3 elite players + value picks
   - **Zero RB**: Punt RB early, load WR/TE
   - **Hero RB**: One elite RB + depth everywhere
   - **Late QB**: Minimum QB spend, max skill positions

## MVP Features

### Phase 1 (Core Functionality)
1. Player database with cost values
2. Search with autocomplete
3. Budget tracking
4. Basic roster management
5. Manual target list

### Phase 2 (Optimization)
1. Roster scenario generation
2. Value indicators
3. Position scarcity tracking
4. Draft history tracking

### Phase 3 (Enhanced Features)
1. Real-time draft sync
2. Trade analyzer
3. Keeper league support
4. Multiple league support
5. Mobile app

## Success Metrics
1. Time to find and evaluate a player (<3 seconds)
2. Accuracy of roster projections
3. User satisfaction with suggested rosters
4. Draft completion without budget issues
5. Post-draft team projected points vs. league average

## Development Timeline

### Week 1-2: Setup & Data
- Next.js + Supabase setup
- Player data import
- Database schema implementation
- Basic UI layout with Shadcn

### Week 3-4: Core Features
- Search functionality
- Player display
- Budget tracking
- Roster management

### Week 5-6: Optimization
- Value calculations
- Roster scenario algorithm
- Target player system
- Testing & refinement

### Week 7-8: Polish & Deploy
- UI/UX improvements
- Performance optimization
- Deployment to Vercel
- User testing

## Technical Considerations

### Performance
- Debounced search to minimize API calls
- Client-side caching of player data
- Optimistic UI updates
- Progressive loading of scenarios

### State Management
- Global state for:
  - Current budget
  - Drafted players
  - Available players
  - User roster
  - Target list
- Local state for:
  - Search query
  - Current selected player
  - UI toggles

### Error Handling
- Budget validation
- Duplicate player prevention
- Network error recovery
- Data sync conflicts

## Future Enhancements
1. **Machine Learning Integration**: Predict player values based on draft trends
2. **Multi-User Support**: Live draft rooms with multiple users
3. **Advanced Analytics**: Post-draft analysis and season-long tracking
4. **Custom Scoring**: Support for various league scoring systems
5. **Mock Draft Mode**: Practice with AI opponents
6. **Trade Calculator**: In-season trade evaluation
7. **Waiver Wire Assistant**: Weekly pickup recommendations

## Conclusion

This tool will provide fantasy football players with a competitive advantage during auction drafts by combining real-time budget tracking, value-based player evaluation, and dynamic roster optimization. The focus on speed, usability, and intelligent recommendations will help users build optimal teams within their budget constraints.