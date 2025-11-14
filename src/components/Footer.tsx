interface FooterProps {
  content: {
    tagline: string;
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    note: string;
  };
}

export default function Footer({ content }: FooterProps) {
  return (
    <footer className="bg-[#fff09b] py-[clamp(56px,8vw,96px)] text-sm text-[#4C515A]">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-4">
            <div className="flex items-center gap-2 text-[#111111]">
              <span aria-hidden>🐾</span>
              <span className="text-sm font-semibold uppercase tracking-[0.3em]">Minka</span>
            </div>
            <p>{content.tagline}</p>
          </div>
          <div className="grid flex-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
            {content.columns.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#111111]">
                  {column.title}
                </p>
                <ul className="space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="transition-colors hover:text-[#111111]">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 border-t border-[#111111]/10 pt-6 text-xs text-[#6B7280]">
          {content.note}
        </div>
      </div>
    </footer>
  );
}
