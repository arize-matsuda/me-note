import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type Props = {
  /** 今週（日曜始まり）・今月に筋トレをした日数 */
  week: number;
  month: number;
};

/** 今週・今月に筋トレをした日数 */
export function WorkoutCard({ week, month }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>筋トレ</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">今週</dt>
            <dd className="text-2xl font-semibold tabular-nums">{week}日</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-muted-foreground">今月</dt>
            <dd className="text-2xl font-semibold tabular-nums">{month}日</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
