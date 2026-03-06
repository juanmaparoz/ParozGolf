import Link from "next/link";

const actions = [
  { href: "/liga", label: "Liga", primary: true },
  { href: "/players", label: "Jugadores", primary: false },
  { href: "/courses", label: "Campos", primary: false },
] as const;

export function DashboardActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={
            action.primary
              ? "rounded-lg bg-slate-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              : "rounded-lg border border-slate-600 bg-slate-800/50 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-500 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          }
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}
