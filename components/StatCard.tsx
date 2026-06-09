import { LucideIcon } from "lucide-react";

type Props = {
  title: string;
  value: string;
  description: string;
  icon?: LucideIcon;
};

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: Props) {
  return (
     <div className="rounded-[1.75rem] bg-white p-5 shadow-md transition hover:shadow-xl hover:-translate-y-1 cursor-pointer active:scale-[0.98] dark:bg-neutral-800">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-400">{title}</p>
        {Icon && <Icon size={18} className="text-neutral-400" />}
      </div>

      <h2 className="mt-3 text-4xl font-black">{value}</h2>

      <p className="mt-2 text-sm text-neutral-500">{description}</p>
    </div>
  );
}