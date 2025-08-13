import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Player } from "@/types/database"

interface RosterScenario {
  id: string
  name: string
  description: string
  projectedPoints: number
  strategy: string[]
  budgetAllocation: {
    QB: number
    RB: number
    WR: number
    TE: number
    FLEX: number
    K: number
    DEF: number
    BENCH: number
  }
}

interface RosterSlot {
  position: string
  player?: {
    id: string
    name: string
    price: number
    projected_points?: number
    tier?: number | null
    position_rank?: number | null
    isPotential?: boolean
  }
}

interface RosterScenariosProps {
  remainingBudget: number
  emptySlots: number
  roster: RosterSlot[]
  availablePlayers: Player[]
  rosterData: Array<{
    id: string
    player: Player
    purchasePrice: number
    rosterPosition: string
    draftedAt: string
  }>
  draftedPlayers?: Player[]
  scenarios?: RosterScenario[]
  totalBudget?: number
}

const defaultScenarios: RosterScenario[] = [
  {
    id: 'balanced',
    name: 'Balanced Build',
    description: 'Even distribution across all positions',
    projectedPoints: 165.2,
    strategy: [
      'Spend $35-40 on QB',
      'Allocate $80-90 to RBs',
      'Allocate $70-80 to WRs',
      'Mid-tier TE for $15-20'
    ],
    budgetAllocation: {
      QB: 18,
      RB: 35,
      WR: 30,
      TE: 8,
      FLEX: 5,
      K: 1,
      DEF: 1,
      BENCH: 2
    }
  },
  {
    id: 'stars-scrubs',
    name: 'Stars & Scrubs',
    description: 'Target 2-3 elite players, fill with value picks',
    projectedPoints: 168.7,
    strategy: [
      'Target 1-2 premium RBs',
      'Get elite WR1',
      'Fill remaining with $1-3 players',
      'Late-round QB and TE'
    ],
    budgetAllocation: {
      QB: 3,
      RB: 50,
      WR: 35,
      TE: 3,
      FLEX: 7,
      K: 1,
      DEF: 1,
      BENCH: 0
    }
  },
  {
    id: 'depth-build',
    name: 'Depth Strategy',
    description: 'No single player over $35, build deep bench',
    projectedPoints: 162.4,
    strategy: [
      'No player over $35',
      'Strong bench depth',
      'Target consistency over ceiling',
      'Multiple flex-worthy players'
    ],
    budgetAllocation: {
      QB: 10,
      RB: 30,
      WR: 25,
      TE: 8,
      FLEX: 10,
      K: 2,
      DEF: 3,
      BENCH: 12
    }
  }
]

export function RosterScenarios({ 
  remainingBudget, 
  emptySlots, 
  roster,
  availablePlayers,
  rosterData,
  draftedPlayers = [],
  scenarios = defaultScenarios,
  totalBudget = 200
}: RosterScenariosProps) {
  
  // Calculate remaining slots by position
  const getRemainingSlotsForPosition = (position: string): number => {
    const positionSlots = roster.filter(slot => slot.position === position)
    return positionSlots.filter(slot => !slot.player).length
  }
  
  // Get position requirements from initial roster structure
  const positionRequirements = {
    QB: 1,
    RB: 2, 
    WR: 2,
    TE: 1,
    FLEX: 1, // Can be RB/WR/TE
    K: 1,
    DEF: 1,
    BENCH: 6
  }
  
  // Check if a strategy is still applicable based on drafted players
  const isStrategyApplicable = (scenario: RosterScenario): boolean => {
    const filledSlots = roster.filter(slot => slot.player)
    
    // For Stars & Scrubs: check if we've drafted expensive players that conflict with strategy
    if (scenario.id === 'stars-scrubs') {
      const expensivePlayers = filledSlots.filter(slot => slot.player && slot.player.price > 35)
      const cheapPlayers = filledSlots.filter(slot => slot.player && slot.player.price <= 3)
      // If we have medium-priced players (not stars or scrubs), strategy may not apply
      const mediumPlayers = filledSlots.filter(slot => slot.player && slot.player.price > 3 && slot.player.price <= 35)
      return mediumPlayers.length <= 1 // Allow some flexibility
    }
    
    // For Depth Strategy: check if we've drafted any player over $35
    if (scenario.id === 'depth-build') {
      const expensivePlayers = filledSlots.filter(slot => slot.player && slot.player.price > 35)
      return expensivePlayers.length === 0
    }
    
    // Balanced is generally always applicable
    return true
  }

  // Get available players filtered by position and sorted by tier first, then cost_value
  const getAvailablePlayersByPosition = (position: string): Player[] => {
    // Filter out ALL drafted players (user roster + other teams from draft status)
    const draftedByUserIds = rosterData.map(r => r.player.id)
    const allDraftedPlayerIds = draftedPlayers.map(dp => dp.id) // draftedPlayers is Player[], so use .id directly
    
    const combinedDraftedIds = Array.from(new Set([...draftedByUserIds, ...allDraftedPlayerIds]))
    
    const undraftedPlayers = availablePlayers.filter(player => 
      !combinedDraftedIds.includes(player.id)
    )
    
    // Filter by position (FLEX can be RB, WR, or TE)
    let positionPlayers = undraftedPlayers.filter(player => {
      if (position === 'FLEX') {
        return ['RB', 'WR', 'TE'].includes(player.position)
      }
      return player.position === position
    })
    
    // Sort by tier first (lower tier is better), then by cost_value (higher is better)
    return positionPlayers.sort((a, b) => {
      const aTier = a.tier || 99
      const bTier = b.tier || 99
      
      if (aTier !== bTier) {
        return aTier - bTier // Lower tier first
      }
      
      // If same tier, sort by cost_value (higher first)
      const aCost = Number(typeof a.cost_value === 'string' ? a.cost_value.replace('$', '') : a.cost_value) || 0
      const bCost = Number(typeof b.cost_value === 'string' ? b.cost_value.replace('$', '') : b.cost_value) || 0
      return bCost - aCost
    })
  }

  /**
   * Helper function to assign the best tier player to a position slot within constraints
   * Implements strict tier-first prioritization as specified in the feature requirements
   */
  const assignPlayer = (
    builtRoster: RosterSlot[], 
    budgetRemaining: { value: number }, 
    usedPlayerIds: Set<string>, 
    position: string, 
    maxPrice: number | null = null, 
    minTier: number | null = null
  ): boolean => {
    // Find the first empty slot for the specified position
    const emptySlotIndex = builtRoster.findIndex(s => s.position === position && !s.player)
    if (emptySlotIndex === -1) return false

    // Get available players, already sorted by tier then cost_value (descending)
    const availablePlayersForPosition = getAvailablePlayersByPosition(position)
    
    // Find the most suitable player based on constraints with strict tier prioritization
    const suitablePlayer = availablePlayersForPosition.find(player => {
      const playerCost = Number(typeof player.cost_value === 'string' ? player.cost_value.replace('$', '') : player.cost_value) || 1
      const playerTier = player.tier || 99

      // Apply price constraint if provided
      const priceConstraintMet = maxPrice === null || playerCost <= maxPrice
      // Apply tier constraint if provided (lower tier number is better)
      const tierConstraintMet = minTier === null || playerTier <= minTier

      // Ensure player is within budget, not already used, and meets all constraints
      return playerCost <= budgetRemaining.value && 
             !usedPlayerIds.has(player.id) && 
             priceConstraintMet && 
             tierConstraintMet
    })

    if (suitablePlayer) {
      const playerCost = Number(typeof suitablePlayer.cost_value === 'string' ? suitablePlayer.cost_value.replace('$', '') : suitablePlayer.cost_value) || 1
      
      // Assign the player to the found empty slot
      builtRoster[emptySlotIndex] = {
        ...builtRoster[emptySlotIndex],
        player: {
          id: suitablePlayer.id,
          name: suitablePlayer.name,
          price: playerCost,
          projected_points: suitablePlayer.projected_points || 0,
          tier: suitablePlayer.tier,
          position_rank: suitablePlayer.position_rank,
          isPotential: true
        }
      }
      budgetRemaining.value -= playerCost
      usedPlayerIds.add(suitablePlayer.id)
      return true
    }
    return false
  }

  // Auto-build roster for a scenario with enhanced tier-based optimization
  const buildScenarioRoster = (scenario: RosterScenario) => {
    const builtRoster = [...roster] // Start with current roster state
    const budgetRemaining = { value: remainingBudget } // Use object for mutable reference
    const usedPlayerIds = new Set<string>() // Track players already assigned in this scenario

    // Add already drafted players (from user's actual roster) to the used set
    rosterData.forEach(r => usedPlayerIds.add(r.player.id))

    // Determine the total number of empty slots that need to be filled
    const totalEmptySlotsToFill = builtRoster.filter(slot => !slot.player).length

    // --- Scenario-Specific Logic with Strict Tier Prioritization ---

    if (scenario.id === 'stars-scrubs') {
      // Phase 1: Acquire Elite Players (Stars) - Tier 1 RBs and WRs
      // Attempt to get 1-2 Tier 1 RBs first
      assignPlayer(builtRoster, budgetRemaining, usedPlayerIds, 'RB', null, 1)
      assignPlayer(builtRoster, budgetRemaining, usedPlayerIds, 'RB', null, 1)

      // Attempt to get 1 Elite WR1 (Tier 1)
      assignPlayer(builtRoster, budgetRemaining, usedPlayerIds, 'WR', null, 1)

      // Phase 2: Fill remaining positions with cost-effective players (Scrubs $1-3)
      const scrubPositionOrder = ['WR', 'QB', 'TE', 'FLEX', 'K', 'DEF', 'BENCH']

      for (const position of scrubPositionOrder) {
        const emptySlotsForPosition = builtRoster.filter(slot => slot.position === position && !slot.player).length
        for (let i = 0; i < emptySlotsForPosition; i++) {
          // For QB and TE, allow slightly higher price if budget permits (late-round strategy)
          let maxPrice = 3 // Default scrub price
          if (position === 'QB' || position === 'TE') {
            const remainingSlots = builtRoster.filter(slot => !slot.player).length
            if (remainingSlots > 0) {
              maxPrice = Math.min(Math.max(budgetRemaining.value / remainingSlots, 3), 8) // Up to $8 if budget allows
            }
          }
          assignPlayer(builtRoster, budgetRemaining, usedPlayerIds, position, maxPrice)
        }
      }

    } else if (scenario.id === 'depth-build') {
      // Depth Strategy: No player over $35, maximize bench depth with tier optimization
      const positionsToFill = ['QB', 'RB', 'WR', 'TE', 'FLEX', 'K', 'DEF', 'BENCH']
      
      for (const position of positionsToFill) {
        const emptySlotsForPosition = builtRoster.filter(slot => slot.position === position && !slot.player).length
        for (let i = 0; i < emptySlotsForPosition; i++) {
          // Strict $35 max price constraint with tier-first selection
          assignPlayer(builtRoster, budgetRemaining, usedPlayerIds, position, 35)
        }
      }

    } else if (scenario.id === 'balanced') {
      // Balanced Build: Proportional budget allocation with tier-first selection
      const totalAllocatedBudget = Object.values(scenario.budgetAllocation).reduce((sum, val) => sum + val, 0)
      
      // Sort positions by their budget allocation percentage (descending) to fill higher-priority positions first
      const positionsByBudgetAllocation = Object.entries(scenario.budgetAllocation)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .map(([pos]) => pos)

      for (const position of positionsByBudgetAllocation) {
        const emptySlotsForPosition = builtRoster.filter(slot => slot.position === position && !slot.player).length
        if (emptySlotsForPosition === 0) continue

        // Calculate target budget for this position based on allocation and remaining budget
        const positionBudgetShare = (scenario.budgetAllocation[position as keyof typeof scenario.budgetAllocation] / totalAllocatedBudget)
        const targetBudgetForPosition = budgetRemaining.value * positionBudgetShare
        
        // Distribute target budget across empty slots, ensuring at least $1 per slot
        const budgetPerSlotForPosition = Math.max(1, targetBudgetForPosition / emptySlotsForPosition)

        for (let i = 0; i < emptySlotsForPosition; i++) {
          // Assign player within calculated budget for this slot, prioritizing tier
          assignPlayer(builtRoster, budgetRemaining, usedPlayerIds, position, budgetPerSlotForPosition)
        }
      }
    }

    // --- Final Pass: Fill any remaining empty slots with $1 players (tier-optimized) ---
    const stillEmptySlots = builtRoster.filter(slot => !slot.player)
    for (const slot of stillEmptySlots) {
      const availablePlayersForPosition = getAvailablePlayersByPosition(slot.position)
      // Find the cheapest available player that hasn't been used, prioritizing tier
      const cheapestPlayer = availablePlayersForPosition.find(player => 
        !usedPlayerIds.has(player.id) && 
        ((Number(typeof player.cost_value === 'string' ? player.cost_value.replace('$', '') : player.cost_value) || 1) <= budgetRemaining.value)
      )
      
      if (cheapestPlayer) {
        const playerCost = Math.max(1, Number(typeof cheapestPlayer.cost_value === 'string' ? cheapestPlayer.cost_value.replace('$', '') : cheapestPlayer.cost_value) || 1)
        const slotIndex = builtRoster.findIndex(s => s.position === slot.position && !s.player)
        if (slotIndex !== -1) {
          builtRoster[slotIndex] = {
            ...builtRoster[slotIndex],
            player: {
              id: cheapestPlayer.id,
              name: cheapestPlayer.name,
              price: playerCost,
              projected_points: cheapestPlayer.projected_points || 0,
              tier: cheapestPlayer.tier,
              position_rank: cheapestPlayer.position_rank,
              isPotential: true
            }
          }
          budgetRemaining.value -= playerCost
          usedPlayerIds.add(cheapestPlayer.id)
        }
      } else if (budgetRemaining.value >= 1) {
        // If no player can be found, assign a placeholder to ensure slot is filled
        const slotIndex = builtRoster.findIndex(s => s.position === slot.position && !s.player)
        if (slotIndex !== -1) {
          builtRoster[slotIndex] = {
            ...builtRoster[slotIndex],
            player: {
              id: `placeholder-${slot.position}-${Math.random().toString(36).substring(7)}`,
              name: `Placeholder ${slot.position}`,
              price: 1,
              projected_points: 0,
              tier: 99,
              position_rank: 999,
              isPotential: true
            }
          }
          budgetRemaining.value -= 1
        }
      }
    }

    return builtRoster
  }
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center text-lg font-bold text-card-foreground">
          <svg className="h-5 w-5 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Roster Scenarios
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Strategic approaches for your remaining ${remainingBudget.toFixed(0)} budget
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="grid md:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="bg-muted rounded-lg p-4 space-y-4 border border-border hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="font-bold text-lg text-card-foreground">{scenario.name}</div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                {scenario.description}
              </p>
              
              {!isStrategyApplicable(scenario) && (
                <div className="bg-orange-100 border border-orange-300 text-orange-800 px-3 py-2 rounded-md text-xs">
                  <strong>⚠️ Roster strategy not applicable</strong> - Your drafted players don&apos;t align with this strategy
                </div>
              )}
              
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Strategy
                </span>
                <ul className="text-xs space-y-1 text-foreground">
                  {scenario.strategy.map((point, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase">
                  Budget Allocation
                </span>
                <div className="space-y-2">
                  {Object.entries(positionRequirements).map(([position, slots]) => {
                    const builtRoster = buildScenarioRoster(scenario)
                    const positionSlots = builtRoster.filter(slot => slot.position === position)
                    const remainingSlots = positionSlots.filter(slot => !slot.player).length
                    
                    // Calculate budget per slot based on scenario logic
                    let budgetPerSlot = 0
                    
                    if (scenario.id === 'stars-scrubs') {
                      // For Stars & Scrubs, show remaining budget available for this position
                      budgetPerSlot = remainingSlots > 0 ? remainingBudget / remainingSlots : 0
                    } else {
                      // For other strategies, use proportional allocation with minimum $1 per slot
                      const totalEmptySlots = builtRoster.filter(slot => !slot.player).length
                      const minimumBudgetRequired = totalEmptySlots
                      const availableForAllocation = Math.max(0, remainingBudget - minimumBudgetRequired)
                      
                      const positionBudgetPercent = scenario.budgetAllocation[position as keyof typeof scenario.budgetAllocation]
                      const positionBudget = (availableForAllocation * positionBudgetPercent / 100) + remainingSlots // Add $1 per slot minimum
                      budgetPerSlot = remainingSlots > 0 ? Math.max(1, positionBudget / remainingSlots) : 0
                    }
                    
                    
                    return (
                      <div key={position} className="border border-border rounded p-2 bg-white/50 dark:bg-black/20">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-xs">{position}</span>
                          <span className="text-xs text-muted-foreground">
                            {remainingSlots > 0 ? `$${budgetPerSlot.toFixed(0)}/each` : 'Complete'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {positionSlots.map((slot, index) => (
                            <div key={index} className="flex justify-between text-xs">
                              {slot.player ? (
                                <>
                                  <div className="flex items-center space-x-1">
                                    <span className={slot.player.isPotential ? "text-blue-600 italic" : "text-card-foreground"}>
                                      {slot.player.name}
                                    </span>
                                    {slot.player.isPotential && (
                                      <span className="bg-blue-100 text-blue-800 px-1 rounded text-[10px]">
                                        potential
                                      </span>
                                    )}
                                  </div>
                                  <span className={slot.player.isPotential ? "text-blue-600 font-medium" : "text-success font-medium"}>
                                    ${slot.player.price}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <span className="text-muted-foreground italic">Empty</span>
                                  <span className="text-muted-foreground">-</span>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Scenarios update based on your remaining budget and roster needs
        </p>
      </CardContent>
    </Card>
  )
}