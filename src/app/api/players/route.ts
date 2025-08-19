import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (query) {
      // Search players
      console.log('API: Searching players for query:', query)
      
      const { data, error } = await supabaseServer
        .from('players')
        .select('*')
        .or(`name.ilike.%${query}%,position.ilike.%${query}%,team.ilike.%${query}%`)
        .limit(10)

      if (error) {
        console.error('API: Supabase search error:', error)
        return NextResponse.json(
          { error: `Search failed: ${error.message}` },
          { status: 500 }
        )
      }

      console.log('API: Search results:', data?.length || 0, 'players found')
      return NextResponse.json({ data: data || [] })
    } else {
      // Get all players
      console.log('API: Getting all players')
      
      const { data, error } = await supabaseServer
        .from('players')
        .select('*')
        .order('name')

      if (error) {
        console.error('API: Supabase getAllPlayers error:', error)
        return NextResponse.json(
          { error: `Failed to fetch players: ${error.message}` },
          { status: 500 }
        )
      }

      console.log('API: Successfully fetched', data?.length || 0, 'players')
      return NextResponse.json({ data: data || [] })
    }
  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}