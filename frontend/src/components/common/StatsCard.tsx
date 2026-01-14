import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, icon: Icon, iconColor = "text-primary", trend }: StatsCardProps) {
  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 p-4 md:p-6">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-5 w-5", iconColor)} />
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="text-xl font-bold sm:text-2xl">{value}</div>
        {trend && (
          <p className={cn("text-xs", trend.isPositive ? "text-success" : "text-destructive")}>
            {trend.isPositive ? "+" : ""}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

