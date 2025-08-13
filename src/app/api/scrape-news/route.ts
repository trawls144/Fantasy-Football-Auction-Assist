import { NextRequest, NextResponse } from 'next/server'
import { scrapeRotowireNews } from '@/lib/rotowire-scraper'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { playerId, playerName } = body

    if (!playerId) {
      return NextResponse.json(
        { error: 'Player ID is required' },
        { status: 400 }
      )
    }

    console.log(`Scraping news for player ID: ${playerId}, player name: ${playerName}`)
    const newsData = await scrapeRotowireNews(playerId, playerName)

    if (!newsData) {
      return NextResponse.json(
        { error: 'No news data found for this player' },
        { status: 404 }
      )
    }

    return NextResponse.json(newsData)
    
  } catch (error) {
    console.error('Error in scrape-news API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}