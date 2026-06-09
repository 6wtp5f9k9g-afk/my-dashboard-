type Props = {
  title: string;
  progress: number;
};

export default function GoalCard({ title, progress }: Props) {
  return (
    <div className="rounded-2xl bg-neutral-50 p-4">
      <p className="font-medium">{title}</p>

      <div className="mt-3 h-2 rounded-full bg-neutral-200">
        <div
          className="h-2 rounded-full bg-black"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-neutral-500">{progress}%</p>
    </div>
  );
}