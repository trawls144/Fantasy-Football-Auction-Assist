import { supabase, isSupabaseConfigured } from './supabase'
import { Player } from '@/types/database'

// User ID - in a real app this would come from authentication
const MOCK_USER_ID = '00000000-0000-0000-0000-000000000000'

export interface TargetPlayer extends Player {
  priority: number
  isDrafted?: boolean
}

export interface RosterPlayer {
  id: string
  player: Player
  purchasePrice: number
  rosterPosition: string
  draftedAt: string
}

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
    
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.log('Using mock data for search')
      // Use mock data
      const filtered = mockPlayers.filter(player =>
        player.name.toLowerCase().includes(query.toLowerCase()) ||
        player.position.toLowerCase().includes(query.toLowerCase()) ||
        player.team?.toLowerCase().includes(query.toLowerCase())
      )
      console.log('Mock data filtered results:', filtered.length)
      return filtered.slice(0, 10)
    }

    console.log('Using Supabase for search')

    // First test a simple query to see if we can connect at all
    try {
      const testQuery = await supabase.from('players').select('count', { count: 'exact' })
      console.log('Test query - total players count:', testQuery)
    } catch (testError) {
      console.log('Test query failed:', testError)
    }

    try {
      console.log('Supabase query:', `name.ilike.%${query}%,position.ilike.%${query}%,team.ilike.%${query}%`)
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .or(`name.ilike.%${query}%,position.ilike.%${query}%,team.ilike.%${query}%`)
        .limit(10)
      
      console.log('Supabase raw response:', { data, error, dataLength: data?.length })
      console.log('Search - First player from Supabase:', data?.[0])
      
      if (error) {
        console.warn('Supabase search error, falling back to mock data:', error)
        const filtered = mockPlayers.filter(player =>
          player.name.toLowerCase().includes(query.toLowerCase()) ||
          player.position.toLowerCase().includes(query.toLowerCase()) ||
          player.team?.toLowerCase().includes(query.toLowerCase())
        )
        return filtered.slice(0, 10)
      }
      
      console.log('Returning Supabase data:', data?.length, 'results')
      return data || []
    } catch (error) {
      console.warn('Supabase connection failed, using mock data:', error)
      const filtered = mockPlayers.filter(player =>
        player.name.toLowerCase().includes(query.toLowerCase()) ||
        player.position.toLowerCase().includes(query.toLowerCase()) ||
        player.team?.toLowerCase().includes(query.toLowerCase())
      )
      return filtered.slice(0, 10)
    }
  },

  async getAllPlayers(): Promise<Player[]> {
    console.log('getAllPlayers called')
    
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.log('Supabase not configured, returning mock data:', mockPlayers.length, 'players')
      return mockPlayers
    }

    console.log('Supabase configured, fetching from database')
    
    // First, let's test if the players table exists
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('players')
        .select('count', { count: 'exact', head: true })
      
      console.log('Table existence check:', { count: tableData, error: tableError })
      
      if (tableError) {
        console.error('Players table does not exist or is not accessible:', tableError.message)
        console.log('You need to run the SQL schema in your Supabase dashboard')
        return mockPlayers
      }
    } catch (err) {
      console.error('Failed to check table existence:', err)
      return mockPlayers
    }
    
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name')
      
      console.log('getAllPlayers - Supabase response:', { dataLength: data?.length, error })
      console.log('getAllPlayers - First player from Supabase with all fields:', data?.[0])
      console.log('getAllPlayers - Available columns:', data?.[0] ? Object.keys(data[0]) : [])
      
      if (error) {
        console.warn('Supabase error, falling back to mock data:', error)
        return mockPlayers
      }
      
      if (!data || data.length === 0) {
        console.warn('No data in Supabase database, falling back to mock data')
        return mockPlayers
      }
      
      return data
    } catch (error) {
      console.warn('Supabase connection failed, using mock data:', error)
      return mockPlayers
    }
  },

  async getPlayerById(id: string): Promise<Player | null> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return mockPlayers.find(p => p.id === id) || null
    }

    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        console.warn('Supabase error, falling back to mock data:', error)
        return mockPlayers.find(p => p.id === id) || null
      }
      
      return data
    } catch (error) {
      console.warn('Supabase connection failed, using mock data:', error)
      return mockPlayers.find(p => p.id === id) || null
    }
  }
}

// Roster API
export const rosterApi = {
  async getUserRoster(): Promise<RosterPlayer[]> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return [] // Return empty roster for demo
    }

    try {
      const { data, error } = await supabase
        .from('user_rosters')
        .select(`
          id,
          purchase_price,
          roster_position,
          drafted_at,
          player_id,
          players (*)
        `)
        .eq('user_id', MOCK_USER_ID)
        .order('drafted_at')
      
      if (error) {
        console.warn('Supabase error, returning empty roster:', error)
        return []
      }
      
      return (data || []).map(item => ({
        id: item.id,
        player: item.players as unknown as Player,
        purchasePrice: item.purchase_price,
        rosterPosition: item.roster_position,
        draftedAt: item.drafted_at
      }))
    } catch (error) {
      console.warn('Supabase connection failed, returning empty roster:', error)
      return []
    }
  },

  async draftPlayer(playerId: string, purchasePrice: number, rosterPosition?: string): Promise<boolean> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, draft simulated')
      return true // Simulate success for demo
    }

    try {
      // Add to user roster
      const { error: rosterError } = await supabase
        .from('user_rosters')
        .insert({
          user_id: MOCK_USER_ID,
          player_id: playerId,
          purchase_price: purchasePrice,
          roster_position: rosterPosition
        })
      
      if (rosterError) throw rosterError
      
      // Update draft status
      const { error: statusError } = await supabase
        .from('draft_status')
        .update({
          is_drafted: true,
          drafted_by_user: true,
          drafted_at: new Date().toISOString()
        })
        .eq('player_id', playerId)
      
      if (statusError) throw statusError
      
      return true
    } catch (error) {
      console.warn('Supabase error drafting player, draft simulated:', error)
      return true
    }
  },

  async removePlayer(playerId: string): Promise<boolean> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, remove simulated')
      return true // Simulate success for demo
    }

    try {
      // Remove from user roster
      const { error: rosterError } = await supabase
        .from('user_rosters')
        .delete()
        .eq('user_id', MOCK_USER_ID)
        .eq('player_id', playerId)
      
      if (rosterError) throw rosterError
      
      // Update draft status to make player available again
      const { error: statusError } = await supabase
        .from('draft_status')
        .update({
          is_drafted: false,
          drafted_by_user: false,
          drafted_at: null
        })
        .eq('player_id', playerId)
      
      if (statusError) throw statusError
      
      return true
    } catch (error) {
      console.warn('Supabase error removing player, remove simulated:', error)
      return true
    }
  }
}

// Targets API
export const targetsApi = {
  async getUserTargets(): Promise<TargetPlayer[]> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return [] // Return empty targets for demo
    }

    try {
      const { data, error } = await supabase
        .from('targets')
        .select(`
          id,
          priority,
          player_id,
          players (*)
        `)
        .eq('user_id', MOCK_USER_ID)
        .order('priority')
      
      if (error) {
        console.warn('Supabase error, returning empty targets:', error)
        return []
      }
      
      // Get drafted status for these players
      const playerIds = (data || []).map(item => item.player_id)
      const draftedIds = await draftStatusApi.getDraftedPlayers()
      
      return (data || []).map(item => ({
        ...item.players as unknown as Player,
        priority: item.priority,
        isDrafted: draftedIds.includes(item.player_id)
      }))
    } catch (error) {
      console.warn('Supabase connection failed, returning empty targets:', error)
      return []
    }
  },

  async addTarget(playerId: string, priority: number): Promise<boolean> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, target add simulated')
      return true // Simulate success for demo
    }

    try {
      const { error } = await supabase
        .from('targets')
        .insert({
          user_id: MOCK_USER_ID,
          player_id: playerId,
          priority
        })
      
      if (error) {
        console.warn('Supabase error adding target:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.warn('Supabase connection failed, target add simulated:', error)
      return true
    }
  },

  async removeTarget(playerId: string): Promise<boolean> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, target removal simulated')
      return true // Simulate success for demo
    }

    try {
      const { error } = await supabase
        .from('targets')
        .delete()
        .eq('user_id', MOCK_USER_ID)
        .eq('player_id', playerId)
      
      if (error) {
        console.warn('Supabase error removing target:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.warn('Supabase connection failed, target removal simulated:', error)
      return true
    }
  }
}

// Draft Status API
export const draftStatusApi = {
  async getDraftedPlayers(): Promise<string[]> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      return [] // Return empty for demo
    }

    try {
      const { data, error } = await supabase
        .from('draft_status')
        .select('player_id')
        .eq('is_drafted', true)
      
      if (error) {
        console.warn('Supabase error fetching drafted players:', error)
        return []
      }
      
      return (data || []).map(item => item.player_id)
    } catch (error) {
      console.warn('Supabase connection failed, returning empty drafted list:', error)
      return []
    }
  },

  async markPlayerDrafted(playerId: string, draftedByUser: boolean): Promise<boolean> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, marking as drafted simulated')
      return true // Simulate success for demo
    }

    try {
      // Insert or update draft status
      const { error } = await supabase
        .from('draft_status')
        .upsert({
          player_id: playerId,
          is_drafted: true,
          drafted_by_user: draftedByUser,
          drafted_at: new Date().toISOString()
        })
      
      if (error) {
        console.warn('Supabase error marking player as drafted:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.warn('Supabase connection failed, marking as drafted simulated:', error)
      return true
    }
  },

  async removePlayerFromDrafted(playerId: string): Promise<boolean> {
    // Check if Supabase is properly configured
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured, removing from drafted simulated')
      return true // Simulate success for demo
    }

    try {
      // Update draft status to make player available again
      const { error } = await supabase
        .from('draft_status')
        .update({
          is_drafted: false,
          drafted_by_user: false,
          drafted_at: null
        })
        .eq('player_id', playerId)
      
      if (error) {
        console.warn('Supabase error removing player from drafted:', error)
        return false
      }
      
      return true
    } catch (error) {
      console.warn('Supabase connection failed, removing from drafted simulated:', error)
      return true
    }
  }
}