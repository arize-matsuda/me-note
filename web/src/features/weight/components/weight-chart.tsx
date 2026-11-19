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
  /** 最新の体重（例: 64.8）。記録がなければ null */
  latestWeight: string | null;
  /** 体重のカードに出す補足（例: 7日前よりの増減） */
  weightNote: string | null;
  /** 最新の体脂肪率と、その記録の日付の表示 */
  latestBodyFat: string | null;
  bodyFatNote: string | null;
};

const weightConfig = {
  weight: { label: "体重（kg）", color: "var(--weight)" },
} satisfies ChartConfig;

const bodyFatConfig = {
  bodyFatPercentage: { label: "体脂肪率（%）", color: "var(--body-fat)" },
} satisfies ChartConfig;

/** 直近30日の体重・体脂肪率の推移。単位が違うので、カードを2つに分ける */
export function WeightChart({
  data,
  latestWeight,
  weightNote,
  latestBodyFat,
  bodyFatNote,
}: Props) {
  const hasWeight = data.some((point) => point.weight !== null);
  const hasBodyFat = data.some((point) => point.bodyFatPercentage !== null);

  if (!hasWeight) {
    return (
      <TrendCard title="体重・体脂肪率" value={null} unit="" note={null}>
        <p className="text-sm text-muted-foreground">
          直近30日の記録がありません。
        </p>
      </TrendCard>
    );
  }

  return (
    <>
      <TrendCard
        title="体重（kg）"
        value={latestWeight}
        unit="kg"
        note={weightNote}
      >
        <TrendChart dataKey="weight" config={weightConfig} data={data} />
      </TrendCard>
      {hasBodyFat && (
        <TrendCard
          title="体脂肪率（%）"
          value={latestBodyFat}
          unit="%"
          note={bodyFatNote}
        >
          <TrendChart
            dataKey="bodyFatPercentage"
            config={bodyFatConfig}
            data={data}
          />
        </TrendCard>
      )}
    </>
  );
}

function TrendCard({
  title,
  value,
  unit,
  note,
  children,
}: {
  title: string;
  value: string | null;
  unit: string;
  note: string | null;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-3 md:[--card-spacing:--spacing(6)]">
      <CardHeader className="flex items-baseline justify-between gap-3">
        <CardTitle className="text-base font-bold md:text-[17px]">
          {title}
        </CardTitle>
        <span className="text-xs text-muted-foreground md:text-[13px]">
          直近30日
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {value !== null && (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl font-bold tabular-nums">
              {value}
              <span className="ml-1 text-sm">{unit}</span>
            </span>
            {note && (
              <span className="text-[13px] text-muted-foreground">{note}</span>
            )}
          </p>
        )}
        {children}
      </CardContent>
    </Card>
  );
}

function TrendChart({
  dataKey,
  config,
  data,
}: {
  dataKey: "weight" | "bodyFatPercentage";
  config: ChartConfig;
  data: ChartPoint[];
}) {
  return (
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
          strokeWidth={2.5}
          dot={{ r: 3, fill: "var(--card)" }}
          // 記録がない日は点を打たず、前後の点を線でつなぐ
          connectNulls
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
