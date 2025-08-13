import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, TrendingUp } from "lucide-react"

interface RosterSlot {
  position: string
  player?: {
    name: string
    price: number
    projected_points?: number
  }
}

interface RosterSidebarProps {
  roster: RosterSlot[]
}

export function RosterSidebar({ roster }: RosterSidebarProps) {
  const totalSpent = roster.reduce((total, slot) => 
    total + (slot.player?.price || 0), 0
  )
  
  const totalProjectedPoints = roster.reduce((total, slot) => 
    total + (slot.player?.projected_points || 0), 0
  )

  const filledSlots = roster.filter(slot => slot.player).length
  const starterSlots = roster.slice(0, 10) // First 10 are starters
  const benchSlots = roster.slice(10) // Rest are bench

  const getPositionColor = (position: string) => {
    switch(position) {
      case 'QB': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      case 'RB': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'WR': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
      case 'TE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'FLEX': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
      case 'K': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
      case 'DEF': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
    }
  }

  return (
    <Card className="w-80 shadow-lg border-0 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center">
          <Users className="h-5 w-5 mr-2" />
          My Team
        </CardTitle>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="bg-white/20 rounded p-2 text-center">
            <div className="flex items-center justify-center text-sm">
              <DollarSign className="h-4 w-4 mr-1" />
              ${totalSpent.toFixed(0)}
            </div>
          </div>
          <div className="bg-white/20 rounded p-2 text-center">
            <div className="flex items-center justify-center text-sm">
              <TrendingUp className="h-4 w-4 mr-1" />
              {totalProjectedPoints.toFixed(1)} pts
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            Starters ({starterSlots.filter(s => s.player).length}/10)
          </h4>
          <div className="space-y-2">
            {starterSlots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-white/50 dark:bg-black/20">
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" className={getPositionColor(slot.position)}>
                    {slot.position}
                  </Badge>
                  {slot.player ? (
                    <div>
                      <div className="text-sm font-semibold">{slot.player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ${slot.player.price} • {slot.player.projected_points || 0} pts
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Empty</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
            Bench ({benchSlots.filter(s => s.player).length}/6)
          </h4>
          <div className="space-y-2">
            {benchSlots.map((slot, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded border bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    BENCH
                  </Badge>
                  {slot.player ? (
                    <div>
                      <div className="text-sm font-medium">{slot.player.name}</div>
                      <div className="text-xs text-muted-foreground">
                        ${slot.player.price}
                      </div>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground italic">Empty</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}