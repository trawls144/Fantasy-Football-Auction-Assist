"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Users, X } from "lucide-react"
import { Player } from "@/types/database"

interface DraftedPlayersProps {
  draftedPlayers: Player[]
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
    default: return 'position-bench'
  }
}

const createColumns = (onRemovePlayer?: (playerId: string) => void): ColumnDef<Player>[] => [
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
      return <span className="font-medium">{name}</span>
    },
  },
  {
    accessorKey: "team",
    header: "Team",
    cell: ({ row }) => {
      const team = row.getValue("team") as string
      return <span className="text-sm">{team || '-'}</span>
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
    accessorKey: "cost_value",
    header: "Value",
    cell: ({ row }) => {
      const cost = row.getValue("cost_value") as string | number
      const costValue = Number(typeof cost === 'string' ? cost.replace('$', '') : cost) || 0
      return <span className="font-medium text-accent">${costValue.toFixed(0)}</span>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const player = row.original
      
      if (!onRemovePlayer) {
        return <span className="text-muted-foreground">-</span>
      }
      
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemovePlayer(player.id)}
          className="h-8 w-8 p-0 hover:bg-success hover:text-success-foreground"
          title="Add back to available players"
        >
          <X className="h-4 w-4" />
        </Button>
      )
    },
  },
]

export function DraftedPlayers({ draftedPlayers, onRemovePlayer }: DraftedPlayersProps) {
  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center text-lg font-bold text-card-foreground">
          <Users className="h-5 w-5 mr-2 text-destructive" />
          Drafted by Other Teams ({draftedPlayers.length})
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Players no longer available for draft
        </p>
      </CardHeader>
      
      <CardContent className="p-4">
        {draftedPlayers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No players have been drafted by other teams yet</p>
          </div>
        ) : (
          <DataTable 
            columns={createColumns(onRemovePlayer)} 
            data={draftedPlayers}
            showPagination={true}
          />
        )}
      </CardContent>
    </Card>
  )
}