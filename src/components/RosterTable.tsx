"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Users, DollarSign, TrendingUp, X } from "lucide-react"

interface RosterPlayer {
  position: string
  name?: string
  price?: number
  projected_points?: number
  tier?: number | null
  position_rank?: number | null
  playerId?: string
}

interface RosterTableProps {
  roster: Array<{
    position: string
    player?: {
      id: string
      name: string
      price: number
      projected_points?: number
      tier?: number | null
      position_rank?: number | null
    }
  }>
  onRemovePlayer?: (playerId: string) => void
}

const getPositionColor = (position: string) => {
  switch(position) {
    case 'QB': return 'position-qb'
    case 'RB': return 'position-rb'
    case 'WR': return 'position-wr'
    case 'TE': return 'position-te'
    case 'K': return 'position-k'
    case 'DEF': return 'position-def'
    case 'FLEX': return 'position-flex'
    case 'BENCH': return 'position-bench'
    default: return 'position-bench'
  }
}

const createColumns = (onRemovePlayer?: (playerId: string) => void): ColumnDef<RosterPlayer>[] => [
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => {
      const position = row.getValue("position") as string
      return (
        <Badge className={`px-2 py-1 text-xs rounded ${getPositionColor(position)}`}>
          {position}
        </Badge>
      )
    },
  },
  {
    accessorKey: "name",
    header: "Player",
    cell: ({ row }) => {
      const name = row.getValue("name") as string
      return name ? (
        <span className="font-medium">{name}</span>
      ) : (
        <span className="text-muted-foreground italic">Empty</span>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const price = row.getValue("price") as number
      return price ? (
        <span className="font-medium text-success">${price}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => {
      const tier = row.getValue("tier") as number | null
      return tier ? (
        <span className="text-sm font-medium">{Math.round(tier)}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    accessorKey: "position_rank",
    header: "Pos Rank",
    cell: ({ row }) => {
      const positionRank = row.getValue("position_rank") as number | null
      const position = row.getValue("position") as string
      return positionRank ? (
        <span className="text-sm font-medium">{position}{Math.round(positionRank)}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const rowData = row.original
      const playerId = rowData.playerId
      const name = rowData.name
      
      console.log('Actions cell - playerId:', playerId, 'name:', name, 'onRemovePlayer:', !!onRemovePlayer)
      
      if (!playerId || !name || !onRemovePlayer) {
        return <span className="text-muted-foreground">-</span>
      }
      
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemovePlayer(playerId)}
          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
        >
          <X className="h-4 w-4" />
        </Button>
      )
    },
  },
]

export function RosterTable({ roster, onRemovePlayer }: RosterTableProps) {
  const totalSpent = roster.reduce((total, slot) => 
    total + (slot.player?.price || 0), 0
  )
  
  const totalProjectedPoints = roster.reduce((total, slot) => 
    total + (slot.player?.projected_points || 0), 0
  )

  const filledSlots = roster.filter(slot => slot.player).length

  // Transform roster data for the table - show all positions as they are
  const tableData: RosterPlayer[] = roster.map((slot, index) => ({
    position: slot.position,
    name: slot.player?.name,
    price: slot.player?.price,
    projected_points: slot.player?.projected_points,
    tier: slot.player?.tier,
    position_rank: slot.player?.position_rank,
    playerId: slot.player?.id
  }))

  console.log('RosterTable - roster length:', roster.length, 'tableData length:', tableData.length, tableData)

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center text-lg font-bold text-card-foreground">
          <Users className="h-5 w-5 mr-2 text-primary" />
          My Team
        </CardTitle>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-card-foreground">${totalSpent.toFixed(0)}</div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Spent</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-card-foreground">{totalProjectedPoints.toFixed(1)}</div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Projected</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-card-foreground">{filledSlots}/14</div>
            <span className="text-xs font-medium text-muted-foreground uppercase">Filled</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <DataTable 
          columns={createColumns(onRemovePlayer)} 
          data={tableData}
          showPagination={false}
          disablePagination={true}
        />
      </CardContent>
    </Card>
  )
}