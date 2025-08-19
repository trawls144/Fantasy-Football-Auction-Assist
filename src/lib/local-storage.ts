import { Player } from '@/types/database'

export interface LocalRosterPlayer {
  id: string
  player: Player
  purchasePrice: number
  rosterPosition: string
  draftedAt: string
}

export interface LocalTargetPlayer extends Player {
  priority: number
  isDrafted?: boolean
}

// Storage keys
const STORAGE_KEYS = {
  ROSTER: 'fantasy_auction_roster',
  TARGETS: 'fantasy_auction_targets', 
  DRAFTED_PLAYERS: 'fantasy_auction_drafted_players'
}

// Roster management
export const localRosterStorage = {
  get(): LocalRosterPlayer[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ROSTER)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading roster from localStorage:', error)
      return []
    }
  },

  set(roster: LocalRosterPlayer[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.ROSTER, JSON.stringify(roster))
    } catch (error) {
      console.error('Error saving roster to localStorage:', error)
    }
  },

  add(player: Player, purchasePrice: number, rosterPosition?: string): boolean {
    try {
      const roster = this.get()
      const newRosterPlayer: LocalRosterPlayer = {
        id: `roster_${Date.now()}`,
        player,
        purchasePrice,
        rosterPosition: rosterPosition || player.position,
        draftedAt: new Date().toISOString()
      }
      roster.push(newRosterPlayer)
      this.set(roster)
      
      // Also mark as drafted
      localDraftedStorage.add(player.id)
      
      console.log('Player added to local roster:', player.name)
      return true
    } catch (error) {
      console.error('Error adding player to roster:', error)
      return false
    }
  },

  remove(playerId: string): boolean {
    try {
      const roster = this.get()
      const filtered = roster.filter(item => item.player.id !== playerId)
      this.set(filtered)
      
      // Also remove from drafted
      localDraftedStorage.remove(playerId)
      
      console.log('Player removed from local roster:', playerId)
      return roster.length !== filtered.length
    } catch (error) {
      console.error('Error removing player from roster:', error)
      return false
    }
  },

  clear(): void {
    this.set([])
  }
}

// Targets management
export const localTargetsStorage = {
  get(): LocalTargetPlayer[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TARGETS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading targets from localStorage:', error)
      return []
    }
  },

  set(targets: LocalTargetPlayer[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.TARGETS, JSON.stringify(targets))
    } catch (error) {
      console.error('Error saving targets to localStorage:', error)
    }
  },

  add(player: Player): boolean {
    try {
      const targets = this.get()
      
      // Check if already exists
      if (targets.some(t => t.id === player.id)) {
        console.log('Player already in targets:', player.name)
        return true
      }
      
      const priority = targets.length + 1
      const targetPlayer: LocalTargetPlayer = {
        ...player,
        priority,
        isDrafted: localDraftedStorage.isDrafted(player.id)
      }
      
      targets.push(targetPlayer)
      this.set(targets)
      
      console.log('Player added to local targets:', player.name)
      return true
    } catch (error) {
      console.error('Error adding player to targets:', error)
      return false
    }
  },

  remove(playerId: string): boolean {
    try {
      const targets = this.get()
      const filtered = targets.filter(target => target.id !== playerId)
      this.set(filtered)
      
      console.log('Player removed from local targets:', playerId)
      return targets.length !== filtered.length
    } catch (error) {
      console.error('Error removing player from targets:', error)
      return false
    }
  },

  clear(): void {
    this.set([])
  }
}

// Drafted players management
export const localDraftedStorage = {
  get(): string[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRAFTED_PLAYERS)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading drafted players from localStorage:', error)
      return []
    }
  },

  set(draftedIds: string[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFTED_PLAYERS, JSON.stringify(draftedIds))
    } catch (error) {
      console.error('Error saving drafted players to localStorage:', error)
    }
  },

  add(playerId: string): boolean {
    try {
      const drafted = this.get()
      if (!drafted.includes(playerId)) {
        drafted.push(playerId)
        this.set(drafted)
        console.log('Player marked as drafted locally:', playerId)
      }
      return true
    } catch (error) {
      console.error('Error marking player as drafted:', error)
      return false
    }
  },

  remove(playerId: string): boolean {
    try {
      const drafted = this.get()
      const filtered = drafted.filter(id => id !== playerId)
      this.set(filtered)
      
      console.log('Player removed from drafted locally:', playerId)
      return drafted.length !== filtered.length
    } catch (error) {
      console.error('Error removing player from drafted:', error)
      return false
    }
  },

  isDrafted(playerId: string): boolean {
    return this.get().includes(playerId)
  },

  clear(): void {
    this.set([])
  }
}

// Utility to clear all demo data
export const clearAllDemoData = () => {
  localRosterStorage.clear()
  localTargetsStorage.clear()
  localDraftedStorage.clear()
  console.log('All demo data cleared')
}