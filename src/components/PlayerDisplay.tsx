import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, RefreshCw } from "lucide-react"
import { Player } from "@/types/database"

interface PlayerDisplayProps {
  player: Player | null
  isTarget?: boolean
  onDraft?: (purchased: boolean, price?: number) => void
  onAddTarget?: (player: Player) => void
  onDraftedByOther?: (player: Player) => void
}

export function PlayerDisplay({ player, isTarget = false, onDraft, onAddTarget, onDraftedByOther }: PlayerDisplayProps) {
  const [showPriceInput, setShowPriceInput] = useState(false)
  const [purchasePrice, setPurchasePrice] = useState('')
  const [newsData, setNewsData] = useState<any>(null)
  const [loadingNews, setLoadingNews] = useState(false)

  // Debug logging to see what PlayerDisplay receives
  if (player) {
    console.log('PlayerDisplay received player:', {
      name: player.name,
      adp: player.adp,
      tier: player.tier,
      position_rank: player.position_rank,
      cost_value: player.cost_value,
      adp_type: typeof player.adp,
      tier_type: typeof player.tier,
      position_rank_type: typeof player.position_rank,
      adp_null_check: player.adp !== null && player.adp !== undefined,
      tier_null_check: player.tier !== null && player.tier !== undefined,
      full_player: player
    })
  }

  if (!player) {
    return (
      <Card className="bg-card border border-border shadow-sm">
        <CardContent className="flex items-center justify-center h-64 p-4">
          <div className="text-center text-muted-foreground">
            <div className="mb-4">
              <svg className="w-12 h-12 mx-auto text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="text-lg font-bold text-card-foreground mb-2">Search for a player</div>
            <p className="text-sm text-foreground">Use the search above to find and evaluate players</p>
          </div>
        </CardContent>
      </Card>
    )
  }


  const handleYesClick = () => {
    setShowPriceInput(true)
  }

  const handleConfirmPurchase = () => {
    const price = parseFloat(purchasePrice)
    if (price > 0) {
      onDraft?.(true, price)
      setShowPriceInput(false)
      setPurchasePrice('')
    }
  }

  const handleNoClick = () => {
    onDraft?.(false)
    setShowPriceInput(false)
    setPurchasePrice('')
  }
  
  const handleDraftedByOther = () => {
    if (player && onDraftedByOther) {
      onDraftedByOther(player)
    }
    setShowPriceInput(false)
    setPurchasePrice('')
  }

  const handleGetNews = async () => {
    if (!player) return
    
    setLoadingNews(true)
    try {
      const response = await fetch('/api/scrape-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          playerId: player.id,
          playerName: player.name 
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setNewsData(data)
      } else {
        console.error('Failed to fetch news')
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoadingNews(false)
    }
  }

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold text-card-foreground">{player.name}</div>
            <p className="text-sm text-muted-foreground">{player.team} - {player.position}</p>
          </div>
          <div className="flex items-center space-x-2">
            {isTarget && <Star className="h-5 w-5 text-primary fill-current" />}
            {!isTarget && onAddTarget && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddTarget(player)}
              >
                <Star className="h-3 w-3 mr-1" />
                Add Target
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 p-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              ${player.cost_value ? Number(typeof player.cost_value === 'string' ? player.cost_value.replace('$', '') : player.cost_value).toFixed(0) : 'N/A'}
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Cost Value</span>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-accent">
              {player.adp !== null && player.adp !== undefined ? Number(player.adp).toFixed(1) : 'N/A'}
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">ADP</span>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {player.tier !== null && player.tier !== undefined ? Math.round(Number(player.tier)) : 'N/A'}
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Tier</span>
          </div>
          <div className="text-center p-4 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {player.position_rank !== null && player.position_rank !== undefined ? `${player.position}${Math.round(Number(player.position_rank))}` : 'N/A'}
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Position Rank</span>
          </div>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-muted-foreground uppercase">Recent News</span>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleGetNews}
              disabled={loadingNews}
              className="h-7"
            >
              {loadingNews ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Get Latest News
                </>
              )}
            </Button>
          </div>
          
          {newsData ? (
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <img 
                  src={newsData.teamLogo} 
                  alt={newsData.team} 
                  className="w-6 h-6 rounded"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-card-foreground mb-1">
                    {newsData.headline}
                  </h4>
                  <div className="text-xs text-muted-foreground mb-2">
                    <span className="font-bold">{newsData.position}</span> • {newsData.team} • {newsData.timestamp}
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {newsData.news}
                  </p>
                  {newsData.analysis && (
                    <div className="text-xs text-muted-foreground">
                      <strong>ANALYSIS:</strong> {newsData.analysis}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center">
              Click &quot;Get Latest News&quot; to fetch recent updates
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="text-center text-lg font-bold text-card-foreground">Drafted?</div>
          
          {!showPriceInput ? (
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Button 
                  onClick={handleYesClick}
                  className="flex-1"
                >
                  Yes - Add to My Team
                </Button>
                <Button 
                  onClick={handleNoClick}
                  variant="outline"
                  className="flex-1"
                >
                  No
                </Button>
              </div>
              <Button
                onClick={handleDraftedByOther}
                variant="destructive"
                className="w-full"
              >
                Drafted by Other Team
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Enter purchase price:
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-foreground">$</span>
                <Input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0"
                  className="flex-1"
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleConfirmPurchase}
                  className="flex-1"
                  size="sm"
                  disabled={!purchasePrice || parseFloat(purchasePrice) <= 0}
                >
                  Confirm
                </Button>
                <Button 
                  onClick={() => setShowPriceInput(false)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}