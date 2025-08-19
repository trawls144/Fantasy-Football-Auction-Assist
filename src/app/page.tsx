'use client'

import { useState, useMemo, useEffect } from 'react'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { BudgetTracker } from '@/components/BudgetTracker'
import { PlayerDisplay } from '@/components/PlayerDisplay'
import { PlayerSearch } from '@/components/PlayerSearch'
import { RosterTable } from '@/components/RosterTable'
import { RosterScenarios } from '@/components/RosterScenarios'
import { TargetsTable } from '@/components/TargetsTable'
import { DraftedPlayers } from '@/components/DraftedPlayers'
import { Tiers } from '@/components/Tiers'
import { Player } from '@/types/database'
import { useRoster, useTargets, usePlayers, useDraftStatus } from '@/hooks/useSupabaseData'
import { clearAllDemoData } from '@/lib/local-storage'
import { Button } from '@/components/ui/button'

interface RosterSlot {
  position: string
  player?: {
    id: string
    name: string
    price: number
    projected_points?: number
    tier?: number | null
    position_rank?: number | null
  }
}

const initialRoster: RosterSlot[] = [
  { position: 'QB' },
  { position: 'RB' },
  { position: 'RB' },
  { position: 'WR' },
  { position: 'WR' },
  { position: 'TE' },
  { position: 'FLEX' },
  { position: 'K' },
  { position: 'DEF' },
  { position: 'BENCH' },
  { position: 'BENCH' },
  { position: 'BENCH' },
  { position: 'BENCH' },
  { position: 'BENCH' },
]

export default function Home() {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [totalBudget] = useState(200)
  
  // Use Supabase hooks
  const { roster: rosterData, draftPlayer, removePlayer } = useRoster()
  const { targets, addTarget, removeTarget } = useTargets()
  const { players: allPlayers, getAllPlayers } = usePlayers()
  const { draftedPlayers, markPlayerDrafted, removePlayerFromDrafted } = useDraftStatus()

  // Load all players on component mount for roster scenarios
  useEffect(() => {
    getAllPlayers()
  }, [getAllPlayers])

  // Calculate budget info from real roster data
  const spentAmount = useMemo(() => {
    return rosterData.reduce((total, item) => total + item.purchasePrice, 0)
  }, [rosterData])

  // Convert roster data to display format
  const roster = useMemo(() => {
    const slots = [...initialRoster]
    
    rosterData.forEach(rosterItem => {
      const slotIndex = slots.findIndex(slot => 
        !slot.player && (
          slot.position === rosterItem.rosterPosition ||
          (slot.position === 'FLEX' && ['RB', 'WR', 'TE'].includes(rosterItem.player.position)) ||
          slot.position === 'BENCH'
        )
      )
      
      if (slotIndex !== -1) {
        slots[slotIndex] = {
          ...slots[slotIndex],
          player: {
            id: rosterItem.player.id,
            name: rosterItem.player.name,
            price: rosterItem.purchasePrice,
            projected_points: rosterItem.player.projected_points || 0,
            tier: rosterItem.player.tier,
            position_rank: rosterItem.player.position_rank
          }
        }
      }
    })
    
    return slots
  }, [rosterData])

  const remainingBudget = totalBudget - spentAmount
  const emptySlots = roster.filter(slot => !slot.player).length
  const averagePerSlot = emptySlots > 0 ? remainingBudget / emptySlots : 0

  const handleDraft = async (purchased: boolean, price?: number) => {
    if (purchased && price && selectedPlayer) {
      const success = await draftPlayer(selectedPlayer.id, price, selectedPlayer.position)
      if (!success) {
        // Handle error - maybe show a toast notification
        console.error('Failed to draft player')
      }
    }
    
    setSelectedPlayer(null)
  }

  const handleAddTarget = async (player: Player) => {
    const success = await addTarget(player)
    if (!success) {
      // Handle error
      console.error('Failed to add target')
    }
  }

  const handleRemoveTarget = async (playerId: string) => {
    const success = await removeTarget(playerId)
    if (!success) {
      // Handle error
      console.error('Failed to remove target')
    }
  }

  const handleDraftedByOther = async (player: Player) => {
    const success = await markPlayerDrafted(player)
    if (!success) {
      // Handle error
      console.error('Failed to mark player as drafted')
    }
    setSelectedPlayer(null)
  }

  const handleRemoveDraftedPlayer = async (playerId: string) => {
    const success = await removePlayerFromDrafted(playerId)
    if (!success) {
      // Handle error
      console.error('Failed to remove drafted player')
    }
  }

  const isPlayerTarget = selectedPlayer ? targets.some(t => t.id === selectedPlayer.id) : false

  const handleClearDemoData = () => {
    if (confirm('Clear all demo data? This will reset your roster, targets, and drafted players.')) {
      clearAllDemoData()
      // Refresh the data by calling the fetch functions
      getAllPlayers()
      window.location.reload() // Simple way to refresh all state
    }
  }

  return (
    <DashboardShell>
      <div className="flex-1 space-y-6">
        
        {/* Demo controls and Budget header: Full width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="flex justify-end">
              <Button
                onClick={handleClearDemoData}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                Clear Demo Data
              </Button>
            </div>
            <BudgetTracker
              totalBudget={totalBudget}
              remainingBudget={remainingBudget}
              spentAmount={spentAmount}
              averagePerSlot={averagePerSlot}
              emptySlots={emptySlots}
            />
          </div>
        </div>

        {/* Main layout: 3-column responsive grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Player Search */}
          <div className="space-y-4">
            <PlayerSearch 
              onPlayerSelect={setSelectedPlayer} 
              rosterData={rosterData}
              draftedPlayers={draftedPlayers}
            />
          </div>

          {/* Current Player */}
          <div className="space-y-4">
            <PlayerDisplay
              player={selectedPlayer}
              isTarget={isPlayerTarget}
              onDraft={handleDraft}
              onAddTarget={handleAddTarget}
              onDraftedByOther={handleDraftedByOther}
            />
          </div>

          {/* My Team */}
          <div className="space-y-4">
            <RosterTable roster={roster} onRemovePlayer={removePlayer} />
          </div>
        </div>

        {/* Tiers section: 2/3 width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tiers
              players={allPlayers}
              rosterData={rosterData}
              draftedPlayers={draftedPlayers}
            />
          </div>
        </div>

        {/* Roster Scenarios section: Full width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <RosterScenarios
              remainingBudget={remainingBudget}
              emptySlots={emptySlots}
              roster={roster}
              availablePlayers={allPlayers}
              rosterData={rosterData}
              draftedPlayers={draftedPlayers}
              totalBudget={totalBudget}
            />
          </div>
        </div>

        {/* Targets section: Full width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <TargetsTable
              targets={targets}
              onPlayerSelect={setSelectedPlayer}
              onRemoveTarget={handleRemoveTarget}
            />
          </div>
        </div>

        {/* Drafted Players section: Full width */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <DraftedPlayers
              draftedPlayers={draftedPlayers}
              onRemovePlayer={handleRemoveDraftedPlayer}
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}