import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('API: Getting player by ID:', id)

    const { data, error } = await supabaseServer
      .from('players')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('API: Supabase getPlayerById error:', error)
      return NextResponse.json(
        { error: `Failed to fetch player: ${error.message}` },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }

    console.log('API: Successfully fetched player:', data.name)
    return NextResponse.json({ data })
  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}