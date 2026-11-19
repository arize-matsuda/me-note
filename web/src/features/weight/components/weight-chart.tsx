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
import type { ChartPoint } from "../chart-data";

type Props = {
  /** 直近30日分（記録がない日は値が null） */
  data: ChartPoint[];
};

const weightConfig = {
  weight: { label: "体重（kg）", color: "var(--weight)" },
} satisfies ChartConfig;

const bodyFatConfig = {
  bodyFatPercentage: { label: "体脂肪率（%）", color: "var(--body-fat)" },
} satisfies ChartConfig;

/** 直近30日の体重・体脂肪率の推移。単位が違うので、グラフを2つに分ける */
export function WeightChart({ data }: Props) {
  const hasWeight = data.some((point) => point.weight !== null);
  const hasBodyFat = data.some((point) => point.bodyFatPercentage !== null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>直近30日の推移</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {hasWeight ? (
          <>
            <TrendChart
              title="体重（kg）"
              dataKey="weight"
              config={weightConfig}
              data={data}
            />
            {hasBodyFat && (
              <TrendChart
                title="体脂肪率（%）"
                dataKey="bodyFatPercentage"
                config={bodyFatConfig}
                data={data}
              />
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            直近30日の記録がありません。
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function TrendChart({
  title,
  dataKey,
  config,
  data,
}: {
  title: string;
  dataKey: "weight" | "bodyFatPercentage";
  config: ChartConfig;
  data: ChartPoint[];
}) {
  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="text-sm text-muted-foreground">{title}</figcaption>
      <ChartContainer config={config} className="aspect-auto h-48 w-full">
        <LineChart data={data} margin={{ left: 0, right: 8, top: 8 }}>
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
            // 値の変化が見えるよう、最小値〜最大値の少し外側までを表示する
            domain={["dataMin - 1", "dataMax + 1"]}
            allowDecimals={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey={dataKey}
            type="monotone"
            stroke={`var(--color-${dataKey})`}
            strokeWidth={2}
            dot={{ r: 3 }}
            // 記録がない日は点を打たず、前後の点を線でつなぐ
            connectNulls
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </figure>
  );
}
