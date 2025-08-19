import { supabase, isSupabaseConfigured } from './supabase'
import { Player } from '@/types/database'
import { 
  localRosterStorage, 
  localTargetsStorage, 
  localDraftedStorage,
  LocalRosterPlayer,
  LocalTargetPlayer 
} from './local-storage'

// Track if we're using mock data due to missing tables
let usesMockData = false

// Use local storage types for consistency
export type TargetPlayer = LocalTargetPlayer
export type RosterPlayer = LocalRosterPlayer

// Mock data for when Supabase isn't configured
const mockPlayers: Player[] = [
  // QBs
  {
    id: '1',
    name: 'Patrick Mahomes',
    position: 'QB',
    team: 'KC',
    cost_value: 42.00,
    average_auction_value: 45.00,
    projected_points: 285.5,
    last_week_points: null,
    tier: 1,
    position_rank: 1,
    adp: 25.5,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Josh Allen',
    position: 'QB',
    team: 'BUF',
    cost_value: 38.00,
    average_auction_value: 41.00,
    projected_points: 275.2,
    last_week_points: null,
    tier: 1,
    position_rank: 2,
    adp: 28.2,
    created_at: new Date().toISOString()
  },
  {
    id: '9',
    name: 'Lamar Jackson',
    position: 'QB',
    team: 'BAL',
    cost_value: 35.00,
    average_auction_value: 38.00,
    projected_points: 270.8,
    last_week_points: null,
    tier: 2,
    position_rank: 3,
    adp: 32.1,
    created_at: new Date().toISOString()
  },
  // RBs
  {
    id: '3',
    name: 'Christian McCaffrey',
    position: 'RB',
    team: 'SF',
    cost_value: 58.00,
    average_auction_value: 62.00,
    projected_points: 315.8,
    last_week_points: null,
    tier: 1,
    position_rank: 1,
    adp: 4.2,
    created_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Austin Ekeler',
    position: 'RB',
    team: 'LAC',
    cost_value: 52.00,
    average_auction_value: 54.00,
    projected_points: 290.4,
    last_week_points: null,
    tier: 2,
    position_rank: 2,
    adp: 18.7,
    created_at: new Date().toISOString()
  },
  {
    id: '10',
    name: 'Saquon Barkley',
    position: 'RB',
    team: 'NYG',
    cost_value: 48.00,
    average_auction_value: 51.00,
    projected_points: 285.2,
    last_week_points: null,
    tier: 2,
    position_rank: 3,
    adp: 12.5,
    created_at: new Date().toISOString()
  },
  {
    id: '11',
    name: 'Nick Chubb',
    position: 'RB',
    team: 'CLE',
    cost_value: 45.00,
    average_auction_value: 47.00,
    projected_points: 275.8,
    last_week_points: null,
    tier: 2,
    position_rank: 4,
    adp: 15.2,
    created_at: new Date().toISOString()
  },
  // WRs
  {
    id: '5',
    name: 'Cooper Kupp',
    position: 'WR',
    team: 'LAR',
    cost_value: 48.00,
    average_auction_value: 51.00,
    projected_points: 280.9,
    last_week_points: null,
    tier: 1,
    position_rank: 1,
    adp: 12.8,
    created_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Davante Adams',
    position: 'WR',
    team: 'LV',
    cost_value: 46.00,
    average_auction_value: 49.00,
    projected_points: 275.6,
    last_week_points: null,
    tier: 1,
    position_rank: 2,
    adp: 22.1,
    created_at: new Date().toISOString()
  },
  {
    id: '12',
    name: 'Tyreek Hill',
    position: 'WR',
    team: 'MIA',
    cost_value: 44.00,
    average_auction_value: 47.00,
    projected_points: 270.5,
    last_week_points: null,
    tier: 1,
    position_rank: 3,
    adp: 8.9,
    created_at: new Date().toISOString()
  },
  {
    id: '13',
    name: 'Stefon Diggs',
    position: 'WR',
    team: 'BUF',
    cost_value: 42.00,
    average_auction_value: 45.00,
    projected_points: 265.8,
    last_week_points: null,
    tier: 2,
    position_rank: 4,
    adp: 16.4,
    created_at: new Date().toISOString()
  },
  {
    id: '14',
    name: 'DeAndre Hopkins',
    position: 'WR',
    team: 'ARI',
    cost_value: 38.00,
    average_auction_value: 41.00,
    projected_points: 255.2,
    last_week_points: null,
    tier: 2,
    position_rank: 5,
    adp: 24.7,
    created_at: new Date().toISOString()
  },
  // TEs
  {
    id: '7',
    name: 'Travis Kelce',
    position: 'TE',
    team: 'KC',
    cost_value: 24.00,
    average_auction_value: 27.00,
    projected_points: 210.3,
    last_week_points: null,
    tier: 1,
    position_rank: 1,
    adp: 35.6,
    created_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Mark Andrews',
    position: 'TE',
    team: 'BAL',
    cost_value: 18.00,
    average_auction_value: 20.00,
    projected_points: 185.7,
    last_week_points: null,
    tier: 2,
    position_rank: 2,
    adp: 55.4,
    created_at: new Date().toISOString()
  },
  {
    id: '15',
    name: 'George Kittle',
    position: 'TE',
    team: 'SF',
    cost_value: 15.00,
    average_auction_value: 17.00,
    projected_points: 175.2,
    last_week_points: null,
    tier: 2,
    position_rank: 3,
    adp: 62.8,
    created_at: new Date().toISOString()
  },
  // K & DEF
  {
    id: '16',
    name: 'Justin Tucker',
    position: 'K',
    team: 'BAL',
    cost_value: 2.00,
    average_auction_value: 3.00,
    projected_points: 145.8,
    last_week_points: null,
    tier: 1,
    position_rank: 1,
    adp: 145.2,
    created_at: new Date().toISOString()
  },
  {
    id: '17',
    name: 'Bills',
    position: 'DEF',
    team: 'BUF',
    cost_value: 2.00,
    average_auction_value: 3.00,
    projected_points: 125.4,
    last_week_points: null,
    tier: 1,
    position_rank: 1,  
    adp: 142.7,
    created_at: new Date().toISOString()
  }
]

// Players API
export const playersApi = {
  async searchPlayers(query: string): Promise<Player[]> {
    console.log('searchPlayers called with query:', query)
    
    // Always try Supabase first if configured, regardless of usesMockData flag
    if (isSupabaseConfigured()) {
      console.log('Supabase configured, attempting search')
      
      try {
        console.log('Supabase query:', `name.ilike.%${query}%,position.ilike.%${query}%,team.ilike.%${query}%`)
        
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .or(`name.ilike.%${query}%,position.ilike.%${query}%,team.ilike.%${query}%`)
          .limit(10)
        
        console.log('Supabase search response:', { data, error, dataLength: data?.length })
        console.log('Search - First player from Supabase:', data?.[0])
        
        if (error) {
          console.warn('Supabase search error, falling back to mock data:', error)
        } else if (data && data.length > 0) {
          console.log('Returning Supabase search data:', data.length, 'results')
          return data
        } else {
          console.log('No results from Supabase search')
          return []
        }
      } catch (error) {
        console.warn('Supabase search connection failed:', error)
      }
    } else {
      console.log('Supabase not configured, using mock data')
    }

    // Fallback to mock data
    console.log('Using mock data for search')
    const filtered = mockPlayers.filter(player =>
      player.name.toLowerCase().includes(query.toLowerCase()) ||
      player.position.toLowerCase().includes(query.toLowerCase()) ||
      player.team?.toLowerCase().includes(query.toLowerCase())
    )
    console.log('Mock data filtered results:', filtered.length)
    return filtered.slice(0, 10)
  },

  async getAllPlayers(): Promise<Player[]> {
    console.log('getAllPlayers called')
    
    // Always try Supabase first if configured
    if (isSupabaseConfigured()) {
      console.log('Supabase configured, attempting to fetch from database')
      
      try {
        // First, test if the players table exists
        const { data: tableData, error: tableError } = await supabase
          .from('players')
          .select('count', { count: 'exact', head: true })
        
        console.log('Table existence check:', { count: tableData, error: tableError })
        
        if (tableError) {
          console.log('Players table does not exist or is not accessible:', tableError.message || 'No error message')
          console.log('Falling back to mock data for local testing')
          usesMockData = true // Mark that we're using mock data due to missing tables
          return mockPlayers
        }
        
        // Try to get all players
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .order('name')
        
        console.log('getAllPlayers - Supabase response:', { dataLength: data?.length, error })
        console.log('getAllPlayers - First player from Supabase:', data?.[0])
        
        if (error) {
          console.warn('Supabase error fetching players:', error)
        } else if (data && data.length > 0) {
          console.log('Successfully fetched', data.length, 'players from Supabase')
          return data
        } else {
          console.log('No players found in Supabase database')
          return mockPlayers
        }
      } catch (error) {
        console.warn('Supabase connection failed:', error)
      }
    } else {
      console.log('Supabase not configured')
    }
    
    // Fallback to mock data
    console.log('Using mock data:', mockPlayers.length, 'players')
    return mockPlayers
  },

  async getPlayerById(id: string): Promise<Player | null> {
    console.log('getPlayerById called with id:', id)
    
    // Always try Supabase first if configured
    if (isSupabaseConfigured()) {
      console.log('Supabase configured, attempting to fetch player by ID')
      
      try {
        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) {
          console.warn('Supabase error fetching player by ID:', error)
        } else if (data) {
          console.log('Successfully fetched player from Supabase:', data.name)
          return data
        }
      } catch (error) {
        console.warn('Supabase connection failed for getPlayerById:', error)
      }
    } else {
      console.log('Supabase not configured for getPlayerById')
    }
    
    // Fallback to mock data
    console.log('Using mock data for getPlayerById')
    return mockPlayers.find(p => p.id === id) || null
  }
}

// Roster API - now uses local storage for all user actions
export const rosterApi = {
  async getUserRoster(): Promise<RosterPlayer[]> {
    console.log('GET USER ROSTER CALLED - using local storage')
    return localRosterStorage.get()
  },

  async draftPlayer(playerId: string, purchasePrice: number, rosterPosition?: string): Promise<boolean> {
    console.log('DRAFT PLAYER CALLED - using local storage:', { playerId, purchasePrice, rosterPosition })
    
    // Get player data (from Supabase or mock data)
    const player = await playersApi.getPlayerById(playerId)
    if (!player) {
      console.error('Player not found:', playerId)
      return false
    }
    
    // Add to local roster
    return localRosterStorage.add(player, purchasePrice, rosterPosition)
  },

  async removePlayer(playerId: string): Promise<boolean> {
    console.log('REMOVE PLAYER CALLED - using local storage:', playerId)
    return localRosterStorage.remove(playerId)
  }
}

// Targets API - now uses local storage
export const targetsApi = {
  async getUserTargets(): Promise<TargetPlayer[]> {
    console.log('GET USER TARGETS CALLED - using local storage')
    return localTargetsStorage.get()
  },

  async addTarget(playerId: string, priority: number): Promise<boolean> {
    console.log('ADD TARGET CALLED - using local storage:', playerId)
    
    // Get player data (from Supabase or mock data)
    const player = await playersApi.getPlayerById(playerId)
    if (!player) {
      console.error('Player not found:', playerId)
      return false
    }
    
    // Add to local targets
    return localTargetsStorage.add(player)
  },

  async removeTarget(playerId: string): Promise<boolean> {
    console.log('REMOVE TARGET CALLED - using local storage:', playerId)
    return localTargetsStorage.remove(playerId)
  }
}

// Draft Status API - now uses local storage
export const draftStatusApi = {
  async getDraftedPlayers(): Promise<string[]> {
    console.log('GET DRAFTED PLAYERS CALLED - using local storage')
    return localDraftedStorage.get()
  },

  async markPlayerDrafted(playerId: string, draftedByUser: boolean): Promise<boolean> {
    console.log('MARK PLAYER DRAFTED CALLED - using local storage:', playerId)
    return localDraftedStorage.add(playerId)
  },

  async removePlayerFromDrafted(playerId: string): Promise<boolean> {
    console.log('REMOVE PLAYER FROM DRAFTED CALLED - using local storage:', playerId)
    return localDraftedStorage.remove(playerId)
  }
}