import React from "react";
import {
  CalendarDays,
  Dumbbell,
  QrCode,
  ScrollText,
  Timer,
  Trophy,
  ClipboardList,
  ArrowRight,
  Minus,
} from "lucide-react";

const panelItems = [
  { icon: CalendarDays, title: "Event Blocks", desc: "Calculate dates", href: "#tool-bay" },
  { icon: Dumbbell, title: "Loading", desc: "Prepare bar work", href: "#tool-bay" },
  { icon: QrCode, title: "Gym Share", desc: "Create QR output", href: "#tool-bay" },
  { icon: ScrollText, title: "Session Records", desc: "Capture notes", href: "#tool-bay" },
];

const toolBay = [
  { icon: CalendarDays, title: "Event Block Calculator", desc: "Calculate block and taper dates.", href: "#" },
  { icon: Timer, title: "IronClock", desc: "Prepare loading and timed work.", href: "#" },
  { icon: QrCode, title: "Gym Share", desc: "Create gym text and QR output.", href: "#" },
  { icon: ClipboardList, title: "Session Log", desc: "Record simple session notes.", href: "#" },
  { icon: Trophy, title: "Meet Planner", desc: "Map meet-day preparation dates.", href: "#" },
  { icon: Dumbbell, title: "Load Sheet", desc: "Structure loading details.", href: "#" },
];

export default function Landing() {
  return (
    <main
      data-testid="landing-page"
      className="min-h-screen w-full bg-black text-white overflow-x-hidden"
    >
      <header data-testid="top-bar" className="relative z-20 top-divider">
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-14 py-4 sm:py-5">
          <div
            className="font-mono text-[12px] sm:text-sm tracking-[0.18em] uppercase"
            data-testid="brand"
          >
            <span className="text-white">KOLOSSEUM</span>
            <span className="text-white/30 px-1.5 sm:px-2">/</span>
            <span className="text-white">TOOLS</span>
          </div>

          <button
            data-testid="top-minus"
            aria-label="collapse"
            className="text-white/70 hover:text-[var(--lime)] transition-colors"
            type="button"
          >
            <Minus className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2.2} />
          </button>
        </div>
      </header>

      <section data-testid="hero" className="relative w-full overflow-hidden">
        <div className="absolute inset-0 columns-bg" aria-hidden="true" />
        <div className="absolute inset-0 hero-vignette" aria-hidden="true" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 px-6 sm:px-10 lg:px-14 pt-10 lg:pt-14 pb-12 lg:pb-16">
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center">
            <p
              data-testid="hero-eyebrow"
              className="font-mono text-[var(--lime)] text-xs sm:text-sm tracking-[0.22em] uppercase mb-5 rise rise-1"
            >
              PUBLIC TOOL SURFACE
            </p>

            <h1
              data-testid="hero-title"
              className="font-display text-white text-5xl sm:text-6xl lg:text-[68px] xl:text-[78px] max-w-[14ch] mb-6 rise rise-2"
            >
              Strength tools for controlled operations.
            </h1>

            <p
              data-testid="hero-sub"
              className="text-white/70 text-base sm:text-lg leading-relaxed max-w-[46ch] mb-8 rise rise-3"
            >
              Fast public utilities for event planning, loading preparation, gym
              sharing, meet preparation, and session records.
            </p>

            <div className="rise rise-4">
              <a
                data-testid="open-tools-cta"
                href="#tool-bay"
                className="btn-lime inline-flex items-center gap-6 px-7 sm:px-9 py-5 text-sm sm:text-base"
              >
                <span>OPEN TOOLS</span>
                <ArrowRight className="btn-arrow w-5 h-5" strokeWidth={2} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 lg:col-start-9 flex justify-end items-center rise rise-3">
            <div
              data-testid="tools-panel"
              className="lime-panel w-full max-w-[420px] p-6 sm:p-7 rounded-[2px]"
            >
              <h2
                className="font-mono text-[var(--lime)] text-[15px] tracking-[0.2em] uppercase mb-2"
                data-testid="panel-title"
              >
                KOLOSSEUM TOOLS
              </h2>
              <p className="text-white/75 text-sm mb-5">Public utility surface</p>

              <div className="divider-soft mb-1" />

              <ul className="flex flex-col">
                {panelItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title} data-testid={`panel-item-${i}`}>
                      <a
                        href={item.href}
                        className="lime-row flex items-center gap-4 py-3.5 px-1 cursor-pointer"
                      >
                        <span className="tool-icon-box flex items-center justify-center w-11 h-11 rounded-[3px] shrink-0">
                          <Icon className="w-[22px] h-[22px] text-[var(--lime)]" strokeWidth={1.6} />
                        </span>
                        <span className="flex-1">
                          <span className="block text-white text-[15px] font-medium leading-tight">
                            {item.title}
                          </span>
                          <span className="block text-white/55 text-[13px] mt-0.5">
                            {item.desc}
                          </span>
                        </span>
                        <ArrowRight
                          className="row-arrow w-[18px] h-[18px] text-[var(--lime)]"
                          strokeWidth={2}
                        />
                      </a>
                      {i < panelItems.length - 1 && <div className="divider-soft" />}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section
        id="tool-bay"
        data-testid="tool-bay"
        className="relative border-t border-white/[0.06] px-5 sm:px-8 lg:px-14 pt-10 sm:pt-12 lg:pt-14 pb-14 sm:pb-16"
      >
        <p
          className="font-mono text-[var(--lime)] text-[11px] sm:text-xs lg:text-sm tracking-[0.22em] uppercase mb-3 sm:mb-4"
          data-testid="toolbay-eyebrow"
        >
          TOOL BAY
        </p>

        <h3
          className="text-white text-2xl sm:text-3xl lg:text-[36px] font-medium mb-7 sm:mb-9 lg:mb-10"
          data-testid="toolbay-title"
        >
          Open a focused utility.
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-4 lg:gap-4">
          {toolBay.map((tool, i) => {
            const Icon = tool.icon;
            return (
              <a
                key={tool.title}
                href={tool.href}
                data-testid={`tool-card-${i}`}
                className={`tool-card group flex flex-col justify-between p-5 sm:p-5 lg:p-6 rounded-[3px] min-h-[200px] sm:min-h-[210px] lg:min-h-[220px] rise rise-${(i % 6) + 1}`}
              >
                <div>
                  <Icon
                    className="card-icon w-7 h-7 sm:w-8 sm:h-8 text-[var(--lime)] mb-4 sm:mb-5"
                    strokeWidth={1.5}
                  />
                  <h4 className="text-white text-base sm:text-lg font-semibold leading-tight mb-2.5 sm:mb-3">
                    {tool.title}
                  </h4>
                  <p className="text-white/55 text-[13px] sm:text-sm leading-relaxed">
                    {tool.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-4 sm:mt-5">
                  <span className="card-open-label font-mono text-[var(--lime)] text-[11px] tracking-[0.18em] uppercase">
                    Open tool
                  </span>
                  <ArrowRight
                    className="card-arrow w-5 h-5 text-[var(--lime)]"
                    strokeWidth={2}
                  />
                </div>
              </a>
            );
          })}
        </div>
      </section>
    </main>
  );
}
