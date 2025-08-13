import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

interface PlayerNewsData {
  headline: string
  teamLogo: string
  team: string
  position: string
  timestamp: string
  news: string
  analysis: string | null
}

// Function to read CSV and find URL for player ID
function getRotowireUrl(playerId: string): string | null {
  try {
    const csvPath = path.join(process.cwd(), 'Rotowire_URLs.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf-8')
    const lines = csvContent.split('\n')
    
    for (let i = 1; i < lines.length; i++) {
      const [url, id] = lines[i].split(',')
      if (id && id.trim() === playerId) {
        return url
      }
    }
    return null
  } catch (error) {
    console.error('Error reading CSV:', error)
    return null
  }
}

// Function to create search URL from player name
function createSearchUrl(playerName: string): string {
  // Split name into first and last name
  const nameParts = playerName.trim().split(' ')
  const searchTerm = nameParts.join('+').toLowerCase()
  return `https://www.rotowire.com/search.php?sport=NFL&term=${searchTerm}`
}

export async function scrapeRotowireNews(playerId: string, playerName?: string): Promise<PlayerNewsData | null> {
  let url = getRotowireUrl(playerId)
  
  // If no direct URL found and we have a player name, use search URL
  if (!url && playerName) {
    url = createSearchUrl(playerName)
    console.log(`No direct Rotowire URL found for player ID: ${playerId}, using search URL: ${url}`)
  } else if (!url) {
    console.log(`No Rotowire URL found for player ID: ${playerId} and no player name provided`)
    return null
  }

  try {
    console.log(`Scraping news from: ${url}`)
    
    // Fetch the HTML content - allow redirects (default behavior)
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      redirect: 'follow' // Explicitly follow redirects
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Log the final URL after any redirects for debugging
    console.log(`Final URL after redirects: ${response.url}`)
    
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document
    
    // Find the news block
    const newsBlock = document.querySelector('.p-card__recent-news-block .news-update')
    
    if (!newsBlock) {
      console.log('No news block found on page')
      return null
    }

    // Extract headline
    const headline = newsBlock.querySelector('.news-update__headline')?.textContent?.trim() || ''
    
    // Extract team logo
    const teamLogo = newsBlock.querySelector('.news-update__logo')?.getAttribute('src') || ''
    
    // Extract position and team from meta
    const metaText = newsBlock.querySelector('.news-update__meta')?.textContent?.trim() || ''
    const positionMatch = metaText.match(/^([A-Z]+)/)
    const position = positionMatch ? positionMatch[1] : ''
    const team = metaText.replace(/^[A-Z]+/, '').trim()
    
    // Extract timestamp
    const timestamp = newsBlock.querySelector('.news-update__timestamp')?.textContent?.trim() || ''
    
    // Extract news content
    const newsElement = newsBlock.querySelector('.news-update__news')
    let news = ''
    if (newsElement) {
      news = newsElement.textContent?.trim() || ''
    }
    
    // Extract analysis
    const analysisElement = newsBlock.querySelector('.news-update__analysis')
    let analysis = null
    if (analysisElement) {
      const analysisText = analysisElement.textContent?.trim() || ''
      // Remove the "ANALYSIS" prefix if it exists
      analysis = analysisText.replace(/^ANALYSIS\s*/, '')
    }

    return {
      headline,
      teamLogo,
      team,
      position,
      timestamp,
      news,
      analysis
    }
    
  } catch (error) {
    console.error('Error scraping Rotowire:', error)
    return null
  }
}