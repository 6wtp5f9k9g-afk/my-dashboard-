type Props = {
  title: string;
  value: number;
  description: string;
  onChange: (value: number) => void;
};

export default function LifeAreaCard({
  title,
  value,
  description,
  onChange,
}: Props) {
  return (
    <div className="rounded-3xl bg-white p-5 shadow-md border border-neutral-100">
      <div className="flex justify-between">
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-neutral-500">{description}</p>
        </div>

        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-20 border rounded-xl px-2 text-right"
        />
      </div>

      <div className="mt-4 h-2 bg-neutral-200 rounded-full">
        <div
          className="h-2 bg-black rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}