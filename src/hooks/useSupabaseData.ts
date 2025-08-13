import { useState, useEffect, useCallback } from 'react'
import { Player } from '@/types/database'
import { 
  playersApi, 
  rosterApi, 
  targetsApi, 
  draftStatusApi,
  TargetPlayer,
  RosterPlayer 
} from '@/lib/supabase-client'
import { isSupabaseConfigured } from '@/lib/supabase'

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(false)
  
  // Debug logging for state changes
  useEffect(() => {
    console.log('usePlayers hook - players state changed, new length:', players.length, players)
  }, [players])

  const searchPlayers = useCallback(async (query: string) => {
    console.log('usePlayers hook - searchPlayers called with:', query)
    
    if (!query.trim()) {
      console.log('usePlayers hook - empty query, clearing results')
      setPlayers([])
      return
    }
    
    setLoading(true)
    console.log('usePlayers hook - setting loading to true')
    
    try {
      const results = await playersApi.searchPlayers(query)
      console.log('usePlayers hook - got results from API:', results.length, results)
      setPlayers(results)
      console.log('usePlayers hook - state updated with results, new length should be:', results.length)
    } catch (error) {
      console.error('Error searching players:', error)
      setPlayers([])
    } finally {
      setLoading(false)
      console.log('usePlayers hook - setting loading to false')
    }
  }, [])

  const getAllPlayers = useCallback(async () => {
    console.log('usePlayers hook - getAllPlayers called, setting loading true')
    setLoading(true)
    try {
      const results = await playersApi.getAllPlayers()
      console.log('usePlayers hook - got all players from API:', results.length, results)
      console.log('usePlayers hook - calling setPlayers with:', results)
      setPlayers(results)
      console.log('usePlayers hook - setPlayers called')
    } catch (error) {
      console.error('Error fetching all players:', error)
      setPlayers([])
    } finally {
      setLoading(false)
      console.log('usePlayers hook - setting loading false')
    }
  }, [])

  return {
    players,
    loading,
    searchPlayers,
    getAllPlayers
  }
}

export function useRoster() {
  const [roster, setRoster] = useState<RosterPlayer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRoster = async () => {
    setLoading(true)
    try {
      const rosterData = await rosterApi.getUserRoster()
      setRoster(rosterData)
    } catch (error) {
      console.error('Error fetching roster:', error)
    } finally {
      setLoading(false)
    }
  }

  const draftPlayer = async (playerId: string, purchasePrice: number, rosterPosition?: string) => {
    try {
      const success = await rosterApi.draftPlayer(playerId, purchasePrice, rosterPosition)
      if (success) {
        // Refresh roster data
        await fetchRoster()
      }
      return success
    } catch (error) {
      console.error('Error drafting player:', error)
      return false
    }
  }

  const removePlayer = async (playerId: string) => {
    try {
      const success = await rosterApi.removePlayer(playerId)
      if (success) {
        // Refresh roster data
        await fetchRoster()
      }
      return success
    } catch (error) {
      console.error('Error removing player:', error)
      return false
    }
  }

  useEffect(() => {
    fetchRoster()
  }, [])

  return {
    roster,
    loading,
    fetchRoster,
    draftPlayer,
    removePlayer
  }
}

export function useTargets() {
  const [targets, setTargets] = useState<TargetPlayer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTargets = async () => {
    setLoading(true)
    try {
      const targetsData = await targetsApi.getUserTargets()
      setTargets(targetsData)
    } catch (error) {
      console.error('Error fetching targets:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTarget = async (player: Player) => {
    try {
      // Calculate next priority
      const nextPriority = targets.length + 1
      const success = await targetsApi.addTarget(player.id, nextPriority)
      if (success) {
        // Refresh targets data
        await fetchTargets()
      }
      return success
    } catch (error) {
      console.error('Error adding target:', error)
      return false
    }
  }

  const removeTarget = async (playerId: string) => {
    try {
      const success = await targetsApi.removeTarget(playerId)
      if (success) {
        // Refresh targets data
        await fetchTargets()
      }
      return success
    } catch (error) {
      console.error('Error removing target:', error)
      return false
    }
  }

  useEffect(() => {
    fetchTargets()
  }, [])

  return {
    targets,
    loading,
    fetchTargets,
    addTarget,
    removeTarget
  }
}

export function useDraftStatus() {
  const [draftedPlayers, setDraftedPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDraftedPlayers = async () => {
    setLoading(true)
    try {
      const draftedPlayerIds = await draftStatusApi.getDraftedPlayers()
      // Get full player objects for the drafted player IDs
      const playerPromises = draftedPlayerIds.map(id => playersApi.getPlayerById(id))
      const players = await Promise.all(playerPromises)
      setDraftedPlayers(players.filter(p => p !== null) as Player[])
    } catch (error) {
      console.error('Error fetching drafted players:', error)
    } finally {
      setLoading(false)
    }
  }

  const markPlayerDrafted = async (player: Player) => {
    try {
      const success = await draftStatusApi.markPlayerDrafted(player.id, false) // false = not drafted by user
      if (success) {
        setDraftedPlayers(prev => [...prev, player])
      }
      return success
    } catch (error) {
      console.error('Error marking player as drafted:', error)
      return false
    }
  }

  const removePlayerFromDrafted = async (playerId: string) => {
    try {
      const success = await draftStatusApi.removePlayerFromDrafted(playerId)
      if (success) {
        setDraftedPlayers(prev => prev.filter(p => p.id !== playerId))
      }
      return success
    } catch (error) {
      console.error('Error removing player from drafted:', error)
      return false
    }
  }

  useEffect(() => {
    fetchDraftedPlayers()
  }, [])

  return {
    draftedPlayers,
    loading,
    fetchDraftedPlayers,
    markPlayerDrafted,
    removePlayerFromDrafted,
    isPlayerDrafted: (playerId: string) => draftedPlayers.some(p => p.id === playerId)
  }
}