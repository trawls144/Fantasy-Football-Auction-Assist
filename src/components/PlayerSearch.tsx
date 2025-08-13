'use client'

import { useState, useEffect, useCallback } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Card, CardContent } from "@/components/ui/card"
import { Player } from '@/types/database'
import { usePlayers } from '@/hooks/useSupabaseData'

interface RosterPlayer {
  id: string
  player: Player
  purchasePrice: number
  rosterPosition: string
  draftedAt: string
}

interface PlayerSearchProps {
  onPlayerSelect: (player: Player) => void
  placeholder?: string
  rosterData?: RosterPlayer[]
  draftedPlayers?: Player[]
}

export function PlayerSearch({ onPlayerSelect, placeholder = "Search for players...", rosterData = [], draftedPlayers = [] }: PlayerSearchProps) {
  const [query, setQuery] = useState('')
  const { players, loading, searchPlayers, getAllPlayers } = usePlayers()
  
  // Filter out drafted players (both roster and other teams) and sort by cost_value high to low
  const availablePlayers = players
    .filter(player => 
      !rosterData.some(rosterPlayer => rosterPlayer.player.id === player.id) &&
      !draftedPlayers.some(draftedPlayer => draftedPlayer.id === player.id)
    )
    .sort((a, b) => {
      const aValue = Number(typeof a.cost_value === 'string' ? a.cost_value.replace('$', '') : a.cost_value) || 0
      const bValue = Number(typeof b.cost_value === 'string' ? b.cost_value.replace('$', '') : b.cost_value) || 0
      return bValue - aValue // Sort high to low
    })
  
  console.log('PlayerSearch render - total players:', players.length, 'available:', availablePlayers.length, 'drafted:', rosterData.length, 'loading:', loading, 'query:', query)

  // Load all players on component mount
  useEffect(() => {
    console.log('PlayerSearch - calling getAllPlayers on mount')
    getAllPlayers()
  }, [getAllPlayers])

  // Debounced search effect
  useEffect(() => {
    if (query.length > 2) {
      const timeoutId = setTimeout(() => {
        searchPlayers(query)
      }, 300) // 300ms debounce delay

      return () => clearTimeout(timeoutId)
    } else if (query.length === 0) {
      // Show all players when no query
      getAllPlayers()
    }
  }, [query, searchPlayers, getAllPlayers])

  const handlePlayerSelect = (player: Player) => {
    onPlayerSelect(player)
    // Don't clear query or close dropdown - keep it open and searchable
  }

  return (
    <Card className="bg-card border border-border shadow-sm h-[831px]">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div>
            <div className="text-lg font-bold text-card-foreground">Search Players</div>
            <p className="text-sm text-foreground">Find and evaluate players for your roster</p>
          </div>
          
          <div className="relative">
            <Command className="rounded-lg border" shouldFilter={false}>
              <CommandInput
                placeholder={placeholder}
                value={query}
                onValueChange={setQuery}
                className="h-10"
              />
              <CommandList className="!max-h-none h-[700px] overflow-y-auto">
                  {availablePlayers.length === 0 && !loading && (
                    <CommandEmpty className="py-6">
                      <div className="text-center text-muted-foreground">
                        <svg className="w-4 h-4 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        No available players found.
                      </div>
                    </CommandEmpty>
                  )}
                  {loading && (
                    <div className="py-6 text-center text-muted-foreground">Searching...</div>
                  )}
                  <CommandGroup heading="Available Players">
                    {availablePlayers.map((player) => (
                      <CommandItem
                        key={player.id}
                        onSelect={() => handlePlayerSelect(player)}
                        className="flex justify-between p-3 cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            player.position === 'QB' ? 'bg-[hsl(var(--qb))]' :
                            player.position === 'RB' ? 'bg-[hsl(var(--rb))]' :
                            player.position === 'WR' ? 'bg-[hsl(var(--wr))]' :
                            player.position === 'TE' ? 'bg-[hsl(var(--te))]' :
                            player.position === 'K' ? 'bg-[hsl(var(--k))]' :
                            player.position === 'DEF' ? 'bg-[hsl(var(--def))]' : 'bg-muted'
                          }`} />
                          <div>
                            <span className="font-medium text-card-foreground">{player.name}</span>
                            <div className="text-xs text-muted-foreground">
                              {player.team} - {player.position}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-primary">
                            ${player.cost_value ? Number(typeof player.cost_value === 'string' ? player.cost_value.replace('$', '') : player.cost_value).toFixed(0) : 'N/A'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Tier: {player.tier ?? 'N/A'}
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
            </Command>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}