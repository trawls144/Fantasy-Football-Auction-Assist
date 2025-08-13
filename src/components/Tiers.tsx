'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Player } from '@/types/database'

interface TiersProps {
  players: Player[]
  rosterData: Array<{
    id: string
    player: Player
    purchasePrice: number
    rosterPosition: string | null
  }>
  draftedPlayers: Player[]
}

export function Tiers({ players, rosterData, draftedPlayers }: TiersProps) {
  const playersByTier = useMemo(() => {
    // Group players by tier, filtering out those without tiers
    const tieredPlayers = players.filter(player => player.tier !== null && player.tier !== undefined)
    
    const grouped = tieredPlayers.reduce((acc, player) => {
      const tier = player.tier!
      if (!acc[tier]) {
        acc[tier] = []
      }
      acc[tier].push(player)
      return acc
    }, {} as Record<number, Player[]>)

    // Sort each tier by position rank or cost value
    Object.keys(grouped).forEach(tier => {
      grouped[Number(tier)].sort((a, b) => {
        if (a.position_rank && b.position_rank) {
          return a.position_rank - b.position_rank
        }
        return Number(b.cost_value) - Number(a.cost_value)
      })
    })

    return grouped
  }, [players])

  const getPlayerStatus = (player: Player) => {
    // Check if player is on user's roster
    const isOnRoster = rosterData.some(r => r.player.id === player.id)
    if (isOnRoster) return 'user-drafted'

    // Check if player is drafted by someone else
    const isDraftedByOther = draftedPlayers.some(d => d.id === player.id)
    if (isDraftedByOther) return 'other-drafted'

    return 'available'
  }

  const sortedTiers = Object.keys(playersByTier)
    .map(Number)
    .sort((a, b) => a - b)

  if (sortedTiers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Player Tiers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No tier data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Tiers</CardTitle>
        <p className="text-sm text-muted-foreground">
          Players grouped by tier ranking
        </p>
      </CardHeader>
      <CardContent className="h-96 overflow-y-auto space-y-6">
        {sortedTiers.map(tier => (
          <div key={tier} className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-semibold">
                Tier {tier}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {playersByTier[tier].length} players
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {playersByTier[tier].map(player => {
                const status = getPlayerStatus(player)
                
                return (
                  <div
                    key={player.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md border text-sm",
                      status === 'user-drafted' && "bg-green-50 border-green-200 text-green-800",
                      status === 'other-drafted' && "bg-red-50 border-red-200 text-red-500 line-through",
                      status === 'available' && "bg-background hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Badge variant="secondary" className="text-xs">
                        {player.position}
                      </Badge>
                      <span className="font-medium truncate">
                        {player.name}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      {player.team && (
                        <span>{player.team}</span>
                      )}
                      <span>${typeof player.cost_value === 'string' ? player.cost_value.replace('$', '') : player.cost_value}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}