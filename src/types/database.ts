export interface Player {
  id: string
  name: string
  position: string
  team: string | null
  cost_value: string | number
  average_auction_value: number | null
  projected_points: number | null
  last_week_points: number | null
  tier: number | null
  position_rank: number | null
  adp: number | null
  created_at: string
}

export interface UserRoster {
  id: string
  user_id: string
  player_id: string
  purchase_price: number
  roster_position: string | null
  drafted_at: string
}

export interface Target {
  id: string
  user_id: string
  player_id: string
  priority: number | null
  created_at: string
}

export interface DraftStatus {
  id: string
  player_id: string
  is_drafted: boolean
  drafted_by_user: boolean
  drafted_at: string | null
}