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
    <footer className="bg-[#fff09b] py-[clamp(40px,6vw,96px)] text-sm text-[#4C515A]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-8 sm:gap-10 md:flex-row md:justify-between">
          <div className="max-w-sm space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-[#111111]">
              <span aria-hidden>🐾</span>
              <span className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em]">Minka</span>
            </div>
            <p className="text-xs sm:text-sm">{content.tagline}</p>
          </div>
          <div className="grid flex-1 gap-6 sm:gap-8 sm:grid-cols-2 md:grid-cols-3">
            {content.columns.map((column) => (
              <div key={column.title} className="space-y-2 sm:space-y-3">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[#111111]">
                  {column.title}
                </p>
                <ul className="space-y-1.5 sm:space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a 
                        href={link.href} 
                        className="text-xs sm:text-sm transition-colors hover:text-[#111111] block py-1 min-h-[32px] flex items-center"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8 sm:mt-12 border-t border-[#111111]/10 pt-4 sm:pt-6 text-[10px] sm:text-xs text-[#6B7280] text-center sm:text-left">
          {content.note}
        </div>
      </div>
    </footer>
  );
}
