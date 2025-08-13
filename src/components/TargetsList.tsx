import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, X } from "lucide-react"
import { Player } from "@/types/database"

interface TargetPlayer extends Player {
  priority: number
  isDrafted?: boolean
}

interface TargetsListProps {
  targets: TargetPlayer[]
  onPlayerSelect: (player: Player) => void
  onRemoveTarget: (playerId: string) => void
  onAddTarget: (player: Player) => void
  currentPlayer?: Player | null
}

export function TargetsList({ 
  targets, 
  onPlayerSelect, 
  onRemoveTarget, 
  onAddTarget,
  currentPlayer 
}: TargetsListProps) {
  const isCurrentPlayerTarget = currentPlayer && targets.some(t => t.id === currentPlayer.id)

  const handleAddCurrentPlayer = () => {
    if (currentPlayer && !isCurrentPlayerTarget) {
      onAddTarget(currentPlayer)
    }
  }

  return (
    <Card className="h-fit shadow-lg border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
        <CardTitle className="text-lg flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-200" />
          Target Players
        </CardTitle>
        {currentPlayer && !isCurrentPlayerTarget && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAddCurrentPlayer}
            className="text-xs bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            <Star className="h-3 w-3 mr-1" />
            Add Target
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="space-y-3 p-4">
        {targets.length === 0 ? (
          <div className="text-center py-6">
            <Star className="h-8 w-8 mx-auto text-yellow-400 opacity-50 mb-3" />
            <div className="text-sm text-muted-foreground">
              No target players yet. Search for players and add them as targets.
            </div>
          </div>
        ) : (
          targets
            .sort((a, b) => a.priority - b.priority)
            .map((target, index) => (
              <div 
                key={target.id} 
                className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer hover:border-yellow-300 transition-all duration-200 ${
                  target.isDrafted 
                    ? 'opacity-50 line-through bg-gray-100 dark:bg-gray-800' 
                    : 'bg-white/80 dark:bg-black/20 hover:bg-yellow-50 dark:hover:bg-yellow-900/10'
                }`}
                onClick={() => onPlayerSelect(target)}
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <div>
                    <div className="text-sm font-semibold">{target.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {target.team} - {target.position} • ${Number(target.cost_value).toFixed(0)}
                    </div>
                  </div>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveTarget(target.id)
                  }}
                  className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))
        )}
        
        {targets.length > 0 && (
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Click on a player to view details
          </div>
        )}
      </CardContent>
    </Card>
  )
}