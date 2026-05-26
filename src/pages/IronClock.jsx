import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Minus, Share2 } from "lucide-react";
import "./IronClock.css";

const KG_TO_LB = 2.2046226218;
const LB_TO_KG = 0.45359237;
const PLATE_SETTINGS_KEY = "kolosseum-ironclock-plate-settings-v1";

const ALL_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25, 0.5, 0.25];
const LARGE_PLATES = [25, 20, 15, 10, 5];
const CHANGE_PLATES = [2.5, 1.25, 0.5, 0.25];
const QUICK_PLATES = [25, 0.5, 0.25];
const DEFAULT_AVAILABLE = [25, 20, 15, 10, 5, 2.5, 1.25];
const TIMER_PRESETS = [60, 120, 180, 300];

const round2 = (value) => Math.round(value * 100) / 100;
const display = (value) => {
  const rounded = round2(value);
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
};
const toKg = (value, unit) => (unit === "kg" ? value : value * LB_TO_KG);

const fmtTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const plateClass = (plate) => {
  if (plate >= 25) return "ic-plate-red";
  if (plate >= 20) return "ic-plate-blue";
  if (plate >= 15) return "ic-plate-yellow";
  if (plate >= 10) return "ic-plate-green";
  if (plate >= 5) return "ic-plate-white";
  if (plate >= 2.5) return "ic-plate-black";
  return "ic-plate-small";
};

const plateSize = (plate) => `size-${String(plate).replace(".", "_")}`;

export default function IronClock() {
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("kg");
  const [barKg, setBarKg] = useState(0);
  const [collarsKg, setCollarsKg] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState("");
  const [shareLabel, setShareLabel] = useState("Share");

  const [available, setAvailable] = useState(() => {
    try {
      const saved = localStorage.getItem(PLATE_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          return new Set(parsed.map(Number).filter((plate) => ALL_PLATES.includes(plate)));
        }
      }
    } catch (_) {}

    return new Set(DEFAULT_AVAILABLE);
  });

  const [selectedSeconds, setSelectedSeconds] = useState(180);
  const [remaining, setRemaining] = useState(180);
  const [running, setRunning] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [customMin, setCustomMin] = useState(3);
  const [customSec, setCustomSec] = useState(0);
  const intervalRef = useRef(null);

  const stepKg = useMemo(() => {
    const plates = Array.from(available);
    if (!plates.length) return 2.5;
    return 2 * Math.min(...plates);
  }, [available]);

  const stepTarget = useCallback((direction) => {
    const rawTarget = Number(String(target).trim());
    const step = unit === "lb" ? 5 : stepKg;
    const base = Number.isFinite(rawTarget) && rawTarget > 0 ? rawTarget : 0;
    let next;

    if (direction > 0) {
      next = Math.floor(base / step + 1e-6) * step + step;
    } else {
      next = Math.ceil(base / step - 1e-6) * step - step;
      if (next < 0) next = 0;
    }

    setTarget(unit === "lb" ? String(Math.round(next)) : String(round2(next)));
  }, [target, unit, stepKg]);

  const result = useMemo(() => {
    if (barKg <= 0) return { state: "no-bar" };

    const numericTarget = Number(String(target).trim());
    if (!Number.isFinite(numericTarget) || numericTarget <= 0) return { state: "no-target" };

    const targetKg = toKg(numericTarget, unit);
    const sortedPlates = Array.from(available).sort((a, b) => b - a);
    let remainingPerSide = (targetKg - barKg - collarsKg) / 2;

    if (remainingPerSide < 0 || !sortedPlates.length) {
      const loadedKg = barKg + collarsKg;
      return {
        state: "ok",
        loadedKg,
        plates: [],
        exact: Math.abs(loadedKg - targetKg) < 0.001
      };
    }

    const plates = [];
    for (const plate of sortedPlates) {
      while (remainingPerSide + 0.0001 >= plate) {
        plates.push(plate);
        remainingPerSide -= plate;
      }
    }

    const platesSideKg = plates.reduce((sum, plate) => sum + plate, 0);
    const loadedKg = barKg + collarsKg + platesSideKg * 2;

    return {
      state: "ok",
      loadedKg,
      plates,
      exact: Math.abs(loadedKg - targetKg) < 0.001
    };
  }, [target, unit, barKg, collarsKg, available]);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setRemaining((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running]);

  const setTimer = useCallback((seconds) => {
    setRunning(false);
    const safeSeconds = Math.max(0, seconds);
    setSelectedSeconds(safeSeconds);
    setRemaining(safeSeconds);
    setCustomMin(Math.floor(safeSeconds / 60));
    setCustomSec(safeSeconds % 60);
  }, []);

  const stepTimerSeconds = useCallback((delta) => {
    const total = customMin * 60 + customSec;
    setTimer(Math.max(0, total + delta));
  }, [customMin, customSec, setTimer]);

  const stepTimerMinutes = useCallback((deltaMinutes) => {
    const total = customMin * 60 + customSec;
    setTimer(Math.max(0, total + deltaMinutes * 60));
  }, [customMin, customSec, setTimer]);

  const toggleTimer = useCallback(() => {
    if (running) {
      setRunning(false);
      return;
    }

    if (remaining <= 0) setRemaining(selectedSeconds);
    setRunning(true);
  }, [running, remaining, selectedSeconds]);

  const resetTimer = useCallback(() => {
    setRunning(false);
    setRemaining(selectedSeconds);
  }, [selectedSeconds]);

  const togglePlate = (plate) => {
    setAvailable((previous) => {
      const next = new Set(previous);
      if (next.has(plate)) next.delete(plate);
      else next.add(plate);
      return next;
    });

    setSettingsStatus("Unsaved plate changes.");
  };

  const savePlates = () => {
    try {
      localStorage.setItem(PLATE_SETTINGS_KEY, JSON.stringify(Array.from(available)));
      setSettingsStatus("Plate settings saved on this device.");
    } catch {
      setSettingsStatus("Could not save plate settings on this device.");
    }
  };

  const resetPlates = () => {
    try {
      localStorage.removeItem(PLATE_SETTINGS_KEY);
    } catch (_) {}

    setAvailable(new Set(DEFAULT_AVAILABLE));
    setSettingsStatus("Plate settings reset to default.");
  };

  const share = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Kolosseum IronClock",
          text: "Barbell loading and rest timer.",
          url
        });
        return;
      } catch (_) {
        return;
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShareLabel("Link copied");
        window.setTimeout(() => setShareLabel("Share"), 1500);
      } catch (_) {}
    }
  };

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        setOverlayOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const availableSummary = useMemo(() => {
    return Array.from(available)
      .sort((a, b) => b - a)
      .map((plate) => `${display(plate)}kg`)
      .join(", ");
  }, [available]);

  const loadedPrimary = result.state !== "ok" ? `0 ${unit}` : `${display(result.loadedKg)} kg`;
  const loadedSecondary = result.state !== "ok" ? null : `${display(result.loadedKg * KG_TO_LB)} lb`;

  const pill = (() => {
    if (result.state !== "ok") return { label: "Unset", warning: true };
    if (result.exact) return { label: "Exact", warning: false };
    return { label: "Rounded", warning: true };
  })();

  const perSideText =
    result.state === "ok" && result.plates.length
      ? result.plates.map((plate) => `${display(plate)} kg`).join(" + ")
      : "No plates per side";

  const roundingMessage = () => {
    if (result.state === "no-bar") return "Select a bar before calculating plate loading.";
    if (result.state === "no-target") return "Enter a target weight.";
    if (result.exact) return "";

    const targetKg = toKg(Number(String(target).trim()) || 0, unit);
    const direction = result.loadedKg > targetKg ? "up" : "down";
    const diffKg = Math.abs(result.loadedKg - targetKg);

    if (unit === "lb") {
      const diffLb = diffKg * KG_TO_LB;
      return `Cannot load ${target} lb exactly with kg plates. Rounded ${direction} by ${display(diffLb)} lb (${display(diffKg)} kg).`;
    }

    return `Target cannot be loaded exactly with selected plates. Rounded ${direction} by ${display(diffKg)} kg.`;
  };

  const renderBarbell = () => {
    if (result.state !== "ok" || !result.plates) {
      return (
        <div className="ic-barbell-empty">
          {result.state === "no-bar" ? "Select a bar" : "Enter a target weight"}
        </div>
      );
    }

    return (
      <>
        <div className="ic-bar-shaft" />
        <div className="ic-bar-sleeve" />
        {result.plates.map((plate, index) => (
          <div
            key={`${plate}-${index}`}
            className={`ic-plate ${plateClass(plate)} ${plateSize(plate)}`}
          >
            <span>{display(plate)}</span>
          </div>
        ))}
        {collarsKg > 0 && <div className="ic-bar-collar" />}
        <div className="ic-bar-sleeve-end" />
      </>
    );
  };

  const modalHeadingStyle = {
    fontFamily: "JetBrains Mono, monospace",
    fontSize: 11,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.55)",
    margin: "0 0 10px"
  };

  return (
    <main className="ic-wrap" data-testid="ironclock-page">
      <header className="relative z-20 top-divider">
        <div className="flex items-center justify-between px-5 sm:px-8 lg:px-14 py-4 sm:py-5">
          <Link
            to="/"
            className="font-mono text-[12px] sm:text-sm tracking-[0.18em] uppercase no-underline"
            data-testid="brand-link"
          >
            <span className="text-white">KOLOSSEUM</span>
            <span className="text-white/30 px-1.5 sm:px-2">/</span>
            <span className="text-white">TOOLS</span>
          </Link>

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

      <div className="ic-subbar">
        <Link to="/" className="ic-back" data-testid="back-link">
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          <span>Tools home</span>
        </Link>

        <button
          className="ic-btn ic-btn-secondary"
          onClick={share}
          data-testid="share-btn"
          style={{ padding: "8px 14px" }}
          type="button"
        >
          <Share2 className="w-4 h-4" strokeWidth={2} />
          <span>{shareLabel}</span>
        </button>
      </div>

      <div className="ic-page">
        <p className="ic-eyebrow">Barbell calculator + rest timer</p>
        <h1 className="ic-h1">IronClock</h1>
        <p className="ic-lead">
          Calculate barbell loading, check plate setup, and run a rest timer.
        </p>

        <div className="ic-grid">
          <section className="ic-panel" data-testid="calculator-panel">
            <div className="ic-panel-head">
              <h2>Barbell loading</h2>
              <p>Enter the target weight, choose the bar, and adjust plate availability.</p>
            </div>

            <div className="ic-form-row">
              <label className="ic-field">
                <span>Target weight</span>
                <div className="ic-stepper">
                  <button type="button" className="ic-step-btn" aria-label="decrease target weight" onClick={() => stepTarget(-1)} data-testid="target-dec">-</button>
                  <input type="number" inputMode="decimal" min="0" step="0.5" placeholder="Enter weight" value={target} onChange={(event) => setTarget(event.target.value)} data-testid="target-weight-input" />
                  <button type="button" className="ic-step-btn" aria-label="increase target weight" onClick={() => stepTarget(1)} data-testid="target-inc">+</button>
                </div>
              </label>

              <label className="ic-field">
                <span>Unit</span>
                <select value={unit} onChange={(event) => setUnit(event.target.value)} data-testid="unit-select">
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </label>
            </div>

            <div className="ic-sub">
              <h3>Bar weight</h3>
              <div className="ic-seg">
                {[20, 25].map((bar) => (
                  <button key={bar} type="button" className={`ic-btn-pill ${barKg === bar ? "active" : ""}`} onClick={() => setBarKg(barKg === bar ? 0 : bar)} data-testid={`bar-${bar}`}>
                    {bar}kg bar
                  </button>
                ))}
              </div>
              <p className="ic-helper" data-testid="bar-status">
                {barKg > 0 ? `Current bar weight: ${display(barKg)}kg.` : "Bar not selected. Current bar weight: 0kg."}
              </p>
            </div>

            <div className="ic-sub">
              <h3>Collars</h3>
              <div className="ic-seg">
                <button type="button" className={`ic-btn-pill ${collarsKg === 0 ? "active" : ""}`} onClick={() => setCollarsKg(0)} data-testid="collar-0">Not included</button>
                <button type="button" className={`ic-btn-pill ${collarsKg === 5 ? "active" : ""}`} onClick={() => setCollarsKg(5)} data-testid="collar-5">2.5kg each / 5kg pair</button>
              </div>
            </div>

            <div className="ic-sub">
              <h3>Quick plate availability</h3>
              <div className="ic-seg">
                {QUICK_PLATES.map((plate) => (
                  <button key={plate} type="button" className={`ic-btn-pill ${available.has(plate) ? "active" : ""}`} onClick={() => togglePlate(plate)} data-testid={`quick-plate-${String(plate).replace(".", "_")}`}>
                    {display(plate)}kg available
                  </button>
                ))}
              </div>
            </div>

            <div className="ic-sub">
              <button className="ic-btn ic-btn-secondary ic-btn-full" onClick={() => { setSettingsStatus(""); setSettingsOpen(true); }} data-testid="open-settings-btn" type="button">
                Full plate settings
              </button>
              <p className="ic-helper" data-testid="plate-summary">Available plates: {availableSummary || "none"}</p>
            </div>

            <div className="ic-result" data-testid="result-card">
              <div className="ic-result-top">
                <div>
                  <span className="ic-result-label">Closest load</span>
                  <strong className="ic-result-value" data-testid="loaded-weight">{loadedPrimary}</strong>
                  {result.state === "ok" && <span className="ic-result-secondary" data-testid="loaded-weight-secondary">{loadedSecondary}</span>}
                </div>
                <div className={`ic-pill ${pill.warning ? "ic-pill-warning" : "ic-pill-exact"}`} data-testid="exact-status">{pill.label}</div>
              </div>
              <p className="ic-rounding-note" data-testid="rounding-note">
                {roundingMessage() || (result.state === "ok" ? "Loaded exactly with the available plates." : "Select a bar and enter a target weight.")}
              </p>
              <div className="ic-barbell-wrap">
                <div className="ic-barbell" data-testid="barbell-visual">{renderBarbell()}</div>
              </div>
              <div className="ic-plate-list" data-testid="plate-list">Per side: {perSideText}</div>
            </div>
          </section>

          <section className="ic-panel" data-testid="timer-panel">
            <div className="ic-panel-head">
              <h2>Rest timer</h2>
              <p>Use preset rest times or enter your own.</p>
            </div>

            <div className="ic-timer-display" data-testid="timer-display">{fmtTime(remaining)}</div>

            <div className="ic-timer-presets">
              {TIMER_PRESETS.map((seconds) => (
                <button key={seconds} type="button" className={`ic-btn-pill ${selectedSeconds === seconds ? "active" : ""}`} onClick={() => setTimer(seconds)} data-testid={`preset-${seconds}`}>
                  {fmtTime(seconds).replace(/^0/, "")}
                </button>
              ))}
            </div>

            <div className="ic-form-row">
              <label className="ic-field">
                <span>Custom minutes</span>
                <div className="ic-stepper">
                  <button type="button" className="ic-step-btn" aria-label="decrease minutes" disabled={customMin * 60 + customSec < 60} onClick={() => stepTimerMinutes(-1)} data-testid="custom-min-dec">-</button>
                  <input type="number" inputMode="numeric" min="0" step="1" value={customMin} onChange={(event) => { const minutes = Math.max(0, Number(event.target.value) || 0); setCustomMin(minutes); setTimer(minutes * 60 + customSec); }} data-testid="custom-min" />
                  <button type="button" className="ic-step-btn" aria-label="increase minutes" onClick={() => stepTimerMinutes(1)} data-testid="custom-min-inc">+</button>
                </div>
              </label>

              <label className="ic-field">
                <span>Custom seconds</span>
                <div className="ic-stepper">
                  <button type="button" className="ic-step-btn" aria-label="decrease seconds" disabled={customMin * 60 + customSec <= 0} onClick={() => stepTimerSeconds(-5)} data-testid="custom-sec-dec">-</button>
                  <input type="number" inputMode="numeric" min="0" max="59" step="1" value={customSec} onChange={(event) => { const seconds = Math.max(0, Math.min(59, Number(event.target.value) || 0)); setCustomSec(seconds); setTimer(customMin * 60 + seconds); }} data-testid="custom-sec" />
                  <button type="button" className="ic-step-btn" aria-label="increase seconds" onClick={() => stepTimerSeconds(5)} data-testid="custom-sec-inc">+</button>
                </div>
              </label>
            </div>

            <div className="ic-timer-actions">
              <button className="ic-btn ic-btn-primary" onClick={toggleTimer} data-testid="start-pause-btn" type="button">{running ? "Pause" : "Start"}</button>
              <button className="ic-btn ic-btn-secondary" onClick={resetTimer} data-testid="reset-timer-btn" type="button">Reset</button>
              <button className="ic-btn ic-btn-secondary" onClick={() => setOverlayOpen(true)} data-testid="maximise-btn" type="button">Maximise timer</button>
            </div>
          </section>
        </div>
      </div>

      <div className={`ic-modal ${settingsOpen ? "open" : ""}`} onClick={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }} data-testid="settings-modal">
        <div className="ic-modal-card">
          <div className="ic-modal-top">
            <div>
              <div className="ic-modal-title">Plate settings</div>
              <p className="ic-modal-sub">Choose which plates are available. A plate only counts when selected.</p>
            </div>
            <button className="ic-modal-close" onClick={() => setSettingsOpen(false)} data-testid="close-settings-btn" type="button">Close</button>
          </div>

          <div className="ic-settings-section">
            <h3 style={modalHeadingStyle}>Large plates available</h3>
            <div className="ic-plate-options">
              {LARGE_PLATES.map((plate) => (
                <button key={plate} className={`ic-btn-pill ${available.has(plate) ? "active" : ""}`} onClick={() => togglePlate(plate)} data-testid={`settings-plate-${String(plate).replace(".", "_")}`} type="button">
                  {display(plate)}kg
                </button>
              ))}
            </div>
          </div>

          <div className="ic-settings-section">
            <h3 style={modalHeadingStyle}>Change plates available</h3>
            <div className="ic-plate-options">
              {CHANGE_PLATES.map((plate) => (
                <button key={plate} className={`ic-btn-pill ${available.has(plate) ? "active" : ""}`} onClick={() => togglePlate(plate)} data-testid={`settings-plate-${String(plate).replace(".", "_")}`} type="button">
                  {display(plate)}kg
                </button>
              ))}
            </div>
          </div>

          <div className="ic-settings-actions">
            <button className="ic-btn ic-btn-primary" onClick={savePlates} data-testid="save-plates-btn" type="button">Save plate settings</button>
            <button className="ic-btn ic-btn-secondary" onClick={resetPlates} data-testid="reset-plates-btn" type="button">Reset to default</button>
          </div>

          {settingsStatus && <p className="ic-helper" style={{ marginTop: 14 }} data-testid="settings-status">{settingsStatus}</p>}
        </div>
      </div>

      <div className={`ic-overlay ${overlayOpen ? "open" : ""}`} data-testid="timer-overlay">
        <div className="ic-overlay-card">
          <button className="ic-overlay-close" onClick={() => setOverlayOpen(false)} data-testid="close-overlay-btn" type="button">Close</button>
          <div className="ic-overlay-title">Rest timer</div>
          <div className="ic-overlay-time" data-testid="overlay-timer-display">{fmtTime(remaining)}</div>
          <div className="ic-overlay-actions">
            <button className="ic-btn ic-btn-primary" onClick={toggleTimer} data-testid="overlay-start-pause" type="button">{running ? "Pause" : "Start"}</button>
            <button className="ic-btn ic-btn-secondary" onClick={resetTimer} data-testid="overlay-reset" type="button">Reset</button>
          </div>
        </div>
      </div>
    </main>
  );
}
