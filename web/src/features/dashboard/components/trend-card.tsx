"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import type { DashboardChartPoint } from "../summary";

type Props = {
  /** 直近30日分（体重がない日は null、筋トレをした日は workout が true） */
  data: DashboardChartPoint[];
};

const WORKOUT_COLOR = "var(--workout)";

const config = {
  weight: { label: "体重（kg）", color: "var(--weight)" },
  workoutMark: { label: "筋トレをした日", color: WORKOUT_COLOR },
} satisfies ChartConfig;

/** 直近30日の体重の折れ線グラフに、筋トレをした日の印を重ねる */
export function TrendCard({ data }: Props) {
  const weights = data
    .map((point) => point.weight)
    .filter((weight): weight is number => weight !== null);
  const hasWorkout = data.some((point) => point.workout);

  // 筋トレの印は、グラフの一番下（体重の最小値の少し下）に並べる
  const markY = weights.length > 0 ? Math.floor(Math.min(...weights)) - 1 : 0;
  const chartData = data.map((point) => ({
    ...point,
    workoutMark: point.workout ? markY : null,
  }));

  return (
    <Card className="gap-3 md:[--card-spacing:--spacing(6)]">
      <CardHeader className="flex items-baseline justify-between gap-3">
        <CardTitle className="text-base font-bold md:text-[17px]">
          体重の推移
        </CardTitle>
        <span className="text-xs text-muted-foreground md:text-[13px]">
          直近30日
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {weights.length === 0 && !hasWorkout ? (
          <p className="text-sm text-muted-foreground">
            直近30日の記録がありません。
          </p>
        ) : (
          <>
            <ChartContainer config={config} className="aspect-auto h-56 w-full">
              <LineChart
                data={chartData}
                margin={{ left: 0, right: 8, top: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={24}
                />
                <YAxis
                  width={36}
                  tickLine={false}
                  axisLine={false}
                  domain={[markY - 0.5, "dataMax + 1"]}
                  allowDecimals={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="weight"
                  type="monotone"
                  stroke="var(--color-weight)"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "var(--card)" }}
                  connectNulls
                  isAnimationActive={false}
                />
                <Line
                  dataKey="workoutMark"
                  stroke="transparent"
                  dot={{
                    r: 3.5,
                    fill: WORKOUT_COLOR,
                    stroke: WORKOUT_COLOR,
                  }}
                  activeDot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ChartContainer>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span
                  className="h-0.5 w-3 rounded-full bg-weight"
                  aria-hidden
                />
                体重（kg）
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-workout" aria-hidden />
                筋トレをした日
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
