type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export default function SectionCard({ title, subtitle, children }: Props) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-[0_18px_50px_rgba(15,15,15,0.08)] transition hover:shadow-2xl dark:bg-neutral-800">
      <div className="mb-5">
        <h2 className="text-2xl font-black tracking-tight">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm leading-relaxed text-neutral-500">
            {subtitle}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}