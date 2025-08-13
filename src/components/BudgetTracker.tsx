import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Target, TrendingUp, Wallet } from "lucide-react"

interface BudgetTrackerProps {
  totalBudget: number
  remainingBudget: number
  spentAmount: number
  averagePerSlot: number
  emptySlots: number
}

export function BudgetTracker({
  totalBudget,
  remainingBudget,
  spentAmount,
  averagePerSlot,
  emptySlots
}: BudgetTrackerProps) {
  const spentPercentage = (spentAmount / totalBudget) * 100
  const isLowBudget = remainingBudget < (totalBudget * 0.2)
  const changeIndicator = spentPercentage > 50 ? "high" : spentPercentage > 25 ? "medium" : "low"

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Remaining Budget</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-card-foreground">${remainingBudget.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            {isLowBudget && (
              <Badge variant="destructive" className="text-xs">Low Budget</Badge>
            )}
            {!isLowBudget && `${((remainingBudget / totalBudget) * 100).toFixed(0)}% remaining`}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Total Spent</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-card-foreground">${spentAmount.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            of ${totalBudget.toFixed(0)} total budget
          </p>
          <div className="flex items-center pt-2">
            <Badge variant={changeIndicator === "high" ? "destructive" : changeIndicator === "medium" ? "default" : "secondary"}>
              {spentPercentage.toFixed(1)}% used
            </Badge>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Average Per Slot</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-card-foreground">${averagePerSlot.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            For {emptySlots} remaining slot{emptySlots !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-card border border-border shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
          <CardTitle className="text-xs font-medium text-muted-foreground uppercase">Budget Progress</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-2xl font-bold text-card-foreground">{spentPercentage.toFixed(1)}%</div>
          <Progress value={spentPercentage} className="w-full h-2 mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Budget utilization
          </p>
        </CardContent>
      </Card>
    </div>
  )
}