"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Star, X } from "lucide-react"
import { Player } from "@/types/database"
import { TargetPlayer } from "@/lib/supabase-client"

interface TargetsTableProps {
  targets: TargetPlayer[]
  onPlayerSelect: (player: Player) => void
  onRemoveTarget: (playerId: string) => void
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

export function TargetsTable({ 
  targets, 
  onPlayerSelect, 
  onRemoveTarget
}: TargetsTableProps) {

  const columns: ColumnDef<TargetPlayer>[] = [
    {
      accessorKey: "priority",
      header: "#",
      cell: ({ row }) => {
        const priority = row.getValue("priority") as number
        return (
          <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
            {priority}
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: "Player",
      cell: ({ row }) => {
        const player = row.original
        return (
          <div 
            className={`cursor-pointer ${player.isDrafted ? 'opacity-50 line-through' : ''}`}
            onClick={() => onPlayerSelect(player)}
          >
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4 text-primary fill-current" />
              <span className="font-medium text-card-foreground">{player.name}</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => {
        const player = row.original
        return (
          <Badge className={`px-2 py-1 text-xs rounded ${getPositionColor(player.position)}`}>
            {player.position}
          </Badge>
        )
      },
    },
    {
      accessorKey: "team",
      header: "Team",
      cell: ({ row }) => {
        const team = row.getValue("team") as string
        return <span className="text-sm text-muted-foreground">{team}</span>
      },
    },
    {
      accessorKey: "cost_value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("cost_value") as string | number
        return (
          <span className="font-medium text-success">
            ${value ? Number(typeof value === 'string' ? value.replace('$', '') : value).toFixed(0) : 'N/A'}
          </span>
        )
      },
    },
    {
      accessorKey: "projected_points",
      header: "Projected",
      cell: ({ row }) => {
        const points = row.getValue("projected_points") as number
        return points ? (
          <span className="text-sm">{points.toFixed(1)} pts</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const player = row.original
        return (
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation()
              onRemoveTarget(player.id)
            }}
            className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <X className="h-4 w-4" />
          </Button>
        )
      },
    },
  ]

  // Sort targets by priority
  const sortedTargets = [...targets].sort((a, b) => a.priority - b.priority)

  return (
    <Card className="bg-card border border-border shadow-sm">
      <CardHeader className="p-4">
        <CardTitle className="flex items-center text-lg font-bold text-card-foreground">
          <Star className="h-5 w-5 mr-2 text-primary" />
          Target Players
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {targets.length === 0 ? (
          <div className="text-center py-8">
            <Star className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-foreground">
              No target players yet. Search for players and add them as targets.
            </p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={sortedTargets} 
            searchable={true}
            searchPlaceholder="Search target players..."
          />
        )}
      </CardContent>
    </Card>
  )
}