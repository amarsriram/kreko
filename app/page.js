"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Pattern Reveal Background ───────────────────────────── */
function PatternReveal() {
  const patternRef = useRef(null);
  const posRef = useRef({ x: -1000, y: -1000 });
  const targetRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      targetRef.current = {
        x: e.clientX,
        y: e.clientY + window.scrollY,
      };
    };

    const handleScroll = () => {
      targetRef.current.y =
        targetRef.current.y - posRef.current.y + posRef.current.y;
    };

    const animate = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.1;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.1;

      if (patternRef.current) {
        const x = posRef.current.x;
        const y = posRef.current.y;

        const maskValue = `radial-gradient(
          350px circle at ${x}px ${y}px,
          rgba(0,0,0,1) 0%,
          rgba(0,0,0,0.6) 30%,
          rgba(0,0,0,0.2) 55%,
          transparent 70%
        )`;

        patternRef.current.style.maskImage = maskValue;
        patternRef.current.style.webkitMaskImage = maskValue;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <div style={{ position: "fixed", inset: 0, zIndex: 0, backgroundColor: "#000000" }} />
      <div
        ref={patternRef}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 1,
          backgroundImage: "url('/bg-pattern.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          maskImage: "radial-gradient(1px circle at -1000px -1000px, black, transparent)",
          WebkitMaskImage: "radial-gradient(1px circle at -1000px -1000px, black, transparent)",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      />
    </>
  );
}

/* ─── Cursor Glow Overlay ─────────────────────────────────── */
function CursorGlowOverlay() {
  const glowRef = useRef(null);
  const posRef = useRef({ x: -1000, y: -1000 });
  const targetRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      targetRef.current = { x: e.clientX, y: e.clientY };
    };

    const animate = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.1;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.1;

      if (glowRef.current) {
        glowRef.current.style.background = `radial-gradient(
          350px circle at ${posRef.current.x}px ${posRef.current.y}px,
          rgba(255, 255, 255, 0.08) 0%,
          rgba(255, 255, 255, 0.03) 35%,
          transparent 65%
        )`;
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none" }}
    />
  );
}

/* ─── Hooks ───────────────────────────────────────────────── */
function useDynamicPlaceholder(phrases, typingSpeed = 40, pauseTime = 2500) {
  const [text, setText] = useState("");
  const [phase, setPhase] = useState("typing"); 
  const [phraseIndex, setPhraseIndex] = useState(0);

  useEffect(() => {
    let timeout;
    const currentPhrase = phrases[phraseIndex];

    if (phase === "typing") {
      if (text.length < currentPhrase.length) {
        timeout = setTimeout(() => {
          setText(currentPhrase.slice(0, text.length + 1));
        }, typingSpeed);
      } else {
        timeout = setTimeout(() => setPhase("deleting"), pauseTime);
      }
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timeout = setTimeout(() => {
          setText(currentPhrase.slice(0, text.length - 1));
        }, typingSpeed / 2);
      } else {
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
        setPhase("typing");
      }
    }

    return () => clearTimeout(timeout);
  }, [text, phase, phraseIndex, phrases, typingSpeed, pauseTime]);

  return text;
}

/* ─── Components ──────────────────────────────────────────── */
function ThinkingDots({ mode }) {
  // UPGRADE 3: Contextual Feedback
  let text = "Processing parameters...";
  if (mode === "task") text = "Structuring execution protocol...";
  if (mode === "content") text = "Synthesizing strategy...";
  if (mode === "learn") text = "Deconstructing concept...";
  if (mode === "plan") text = "Architecting timeline...";

  return (
    <div className="flex items-center gap-3">
      <span style={{ color: "rgba(255,255,255,0.5)" }} className="text-[13px] uppercase tracking-widest font-semibold">
        {text}
      </span>
      <div className="thinking-dots">
        <span style={{ backgroundColor: "rgba(255,255,255,0.7)" }} />
        <span style={{ backgroundColor: "rgba(255,255,255,0.7)" }} />
        <span style={{ backgroundColor: "rgba(255,255,255,0.7)" }} />
      </div>
    </div>
  );
}

function FormattedLine({ line, isFirstInsideBlock }) {
  const trimmed = line.trim();
  if (!trimmed) return <div className="h-2 w-full"></div>;

  // 1. MODE TITLE
  if (trimmed.startsWith("### ")) {
    return <h3 className="text-[12px] font-bold tracking-[0.2em] text-[rgba(255,255,255,0.4)] mb-6 uppercase block w-full">{trimmed.replace("### ", "")}</h3>;
  }

  // 2. PHASE / HOOK / MORNING TITLES
  const isPhaseTitle = 
    trimmed.startsWith("PHASE ") || trimmed.startsWith("**PHASE ") ||
    trimmed.startsWith("HOOK:") || trimmed.startsWith("**HOOK:") ||
    trimmed.startsWith("BODY:") || trimmed.startsWith("**BODY:") ||
    trimmed.startsWith("VARIATIONS:") || trimmed.startsWith("**VARIATIONS:") ||
    trimmed.startsWith("MORNING:") || trimmed.startsWith("**MORNING:") ||
    trimmed.startsWith("AFTERNOON:") || trimmed.startsWith("**AFTERNOON:") ||
    trimmed.startsWith("EVENING:") || trimmed.startsWith("**EVENING:") ||
    trimmed.startsWith("NIGHT:") || trimmed.startsWith("**NIGHT:");

  if (isPhaseTitle) {
    const text = trimmed.replace(/\*\*/g, ""); 
    return <h4 className={`text-[15px] font-bold tracking-wider text-white uppercase block w-full ${isFirstInsideBlock ? 'mb-4' : 'mt-6 mb-4'}`}>{text}</h4>;
  }

  // 3. INSIGHT 
  if (trimmed.startsWith("*INSIGHT:") || trimmed.startsWith("INSIGHT:") || trimmed.startsWith("**INSIGHT:**")) {
    const text = trimmed.replace(/\*/g, "").replace("INSIGHT:", "").trim();
    return (
      <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.1)] block w-full">
        <span className="block text-[11px] font-bold tracking-widest text-[rgba(255,255,255,0.5)] uppercase mb-2">Insight</span>
        <p className="text-[15px] leading-relaxed tracking-wide text-[rgba(255,255,255,0.9)] italic block w-full">{text}</p>
      </div>
    );
  }

  // 4. BULLETS & TEXT
  const isList = trimmed.startsWith("- ") || trimmed.startsWith("• ") || /^[0-9]+\./.test(trimmed);
  
  const renderWithBold = (text) => {
    const parts = text.split("**");
    return parts.map((part, i) => (
      i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : <span key={i}>{part}</span>
    ));
  };

  return (
    <div className={`text-[rgba(255,255,255,0.8)] leading-[1.7] block w-full ${isList ? 'mb-2' : 'mb-3'}`}>
      {renderWithBold(trimmed)}
    </div>
  );
}

function parseIntoBlocks(text) {
  const lines = text.split('\n');
  const blocks = [];
  let currentBlock = { type: 'intro', lines: [] }; 

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      if (currentBlock.lines.length > 0) blocks.push(currentBlock);
      currentBlock = { type: 'title', lines: [line] };
    } else if (
      trimmed.startsWith("PHASE ") || trimmed.startsWith("**PHASE ") ||
      trimmed.startsWith("HOOK:") || trimmed.startsWith("**HOOK:") ||
      trimmed.startsWith("BODY:") || trimmed.startsWith("**BODY:") ||
      trimmed.startsWith("VARIATIONS:") || trimmed.startsWith("**VARIATIONS:") ||
      trimmed.startsWith("MORNING:") || trimmed.startsWith("**MORNING:") ||
      trimmed.startsWith("AFTERNOON:") || trimmed.startsWith("**AFTERNOON:") ||
      trimmed.startsWith("EVENING:") || trimmed.startsWith("**EVENING:") ||
      trimmed.startsWith("NIGHT:") || trimmed.startsWith("**NIGHT:")
    ) {
      if (currentBlock.lines.length > 0) blocks.push(currentBlock);
      currentBlock = { type: 'phase', lines: [line] };
    } else if (trimmed.startsWith("*INSIGHT:") || trimmed.startsWith("INSIGHT:") || trimmed.startsWith("**INSIGHT:**")) {
      if (currentBlock.lines.length > 0) blocks.push(currentBlock);
      currentBlock = { type: 'insight', lines: [line] };
    } else {
      currentBlock.lines.push(line);
    }
  }
  if (currentBlock.lines.length > 0) blocks.push(currentBlock);
  return blocks;
}

function TypingEffect({ text, speed = 18 }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    if (!text) return;

    const interval = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));

      if (indexRef.current >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  const blocks = parseIntoBlocks(displayed);

  return (
    <div className="leading-relaxed w-full">
      {blocks.map((block, idx) => {
        if (block.type === 'phase') {
           // RENDER AS A VISUAL PHYSICAL BLOCK
           return (
             <div key={idx} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 mb-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
               {block.lines.map((l, i) => ( <FormattedLine key={i} line={l} isFirstInsideBlock={i === 0} />))}
             </div>
           );
        }
        // Normal rendering for title, intro, insight
        return (
          <div key={idx} className={block.type === 'insight' ? 'mt-4' : ''}>
            {block.lines.map((l, i) => <FormattedLine key={i} line={l} isFirstInsideBlock={false} />)}
          </div>
        );
      })}
      {!done && <span className="typing-cursor ml-1" />}
    </div>
  );
};

function ExecutionModeButton({ label, icon, description, onClick, disabled, isActive }) {
  // UPGRADE 3 & 6: Mode Clarity & Button Authority
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: isActive ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.04)",
        border: isActive ? "1px solid rgba(255, 255, 255, 0.6)" : "1px solid rgba(255, 255, 255, 0.15)",
        transform: isActive ? "scale(0.98)" : "scale(1)",
        boxShadow: isActive ? "0 4px 20px rgba(255,255,255,0.1) inset, 0 0 15px rgba(255,255,255,0.1)" : "none",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      className={`group relative flex flex-col items-start p-5 rounded-2xl text-left overflow-hidden 
        disabled:opacity-30 disabled:cursor-not-allowed 
        hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.4)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.1)] hover:-translate-y-0.5
        active:scale-[0.97] active:bg-[rgba(255,255,255,0.15)]`}
    >
      <div className="flex items-center gap-3 mb-1.5">
        <span className="text-xl grayscale opacity-90 transition-transform duration-300 group-hover:scale-110 group-active:scale-95">{icon}</span>
        <span className={`font-semibold text-[15px] tracking-wide text-white`}>{label}</span>
      </div>
      <span className="text-[13px] font-light leading-relaxed text-[rgba(255,255,255,0.5)] group-hover:text-[rgba(255,255,255,0.8)] transition-colors">
        {description}
      </span>
    </button>
  );
}

function QuickStartChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.04)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
      className="px-4 py-2 rounded-full text-[13px] text-[rgba(255,255,255,0.7)] hover:text-white hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.3)] hover:shadow-[0_4px_15px_rgba(255,255,255,0.05)] active:scale-95 transition-all cursor-pointer truncate max-w-[200px] sm:max-w-none"
    >
      {label}
    </button>
  );
}

/* ─── Main Page ───────────────────────────────────────────── */
export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [headerVisible, setHeaderVisible] = useState(false);
  const inputRef = useRef(null);

  const placeholderText = useDynamicPlaceholder([
    "E.g. Architect a 30-day go-to-market strategy...",
    "E.g. Deconstruct the principles of React...",
    "E.g. Draft a high-conversion sales sequence...",
    "E.g. Optimize my daily deep work schedule..."
  ]);

  useEffect(() => {
    const t = setTimeout(() => setHeaderVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleAction = useCallback(
    async (mode, overrideInput = null) => {
      const finalInput = overrideInput || input.trim();
      if (!finalInput || isLoading) return;

      if (overrideInput) {
        setInput(overrideInput);
      }

      // UPGRADE 10: Instant Interaction Speed
      setActiveMode(mode);
      setIsLoading(true);
      setShowOutput(true);
      setOutput("");

      window.scrollTo({ top: 0, behavior: 'smooth' });

      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input: finalInput, mode }),
        });

        const data = await res.json();
        // Server already has a 400ms delay for perception, no need for extra UI delay here.
        setOutput(data.output || "Execution failed. Protocol terminated.");
      } catch {
        setOutput("System error. Connection refused.");
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading]
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAction("task");
    }
  };

  const actions = [
    { mode: "task", label: "Break It Down", icon: "⚡", description: "Structured micro-action protocol" },
    { mode: "content", label: "Create Content", icon: "✍️", description: "High-leverage narrative generation" },
    { mode: "learn", label: "Explain It", icon: "💡", description: "Fundamental deconstruction" },
    { mode: "plan", label: "Plan My Time", icon: "📋", description: "Strategic timeline architecture" },
  ];

  const quickStarts = [
    { label: "Launch a new product", mode: "task" },
    { label: "Cold email a CEO", mode: "content" },
    { label: "Deconstruct Web3", mode: "learn" },
    { label: "Deep work schedule", mode: "plan" },
  ];

  // UPGRADE 6: Mode Differentiation (Typing Speeds)
  const getTypingSpeed = (mode) => {
    switch (mode) {
      case "task": return 10;   // Fast, rigid
      case "content": return 16; // Flowing
      case "learn": return 22;   // Calm, analytical
      case "plan": return 14;    // Steady
      default: return 16;
    }
  };

  return (
    <>
      <PatternReveal />
      <CursorGlowOverlay />

      <main
        style={{ position: "relative", zIndex: 2, minHeight: "100vh", color: "#ffffff" }}
        className="flex flex-col items-center px-4 pt-16 sm:pt-24 pb-16"
      >
        {/* ── Header ──────────────────────────────────────── */}
        <header
          style={{ transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}
          className={`text-center mb-10 ${
            headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h1
            style={{
              color: "#ffffff",
              fontSize: "clamp(3rem, 7vw, 4.5rem)",
              textShadow: "0 0 80px rgba(255,255,255,0.1)",
              letterSpacing: "-0.02em"
            }}
            className="font-bold mb-3"
          >
            Kreko
          </h1>
          {/* UPGRADE 12: Noise Reduction (dimmed subtitle) */}
          <p
            style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}
            className="text-[14px] sm:text-[15px] uppercase font-medium"
          >
            Your execution engine.
          </p>
        </header>

        {/* ── Content Container ─────────────────────────────── */}
        <div className="w-full max-w-[760px] flex flex-col gap-6">
          {/* ── Input Field ───────────────────────────────── */}
          {/* UPGRADE 2: Input Dominance */}
          <div
            style={{ transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s" }}
            className={`mb-6 ${
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div className="relative group z-10">
              {/* Massive ambient silver glow around input with pulse so it feels alive */}
              <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-[rgba(255,255,255,0.2)] to-transparent rounded-2xl blur-xl opacity-80 group-focus-within:opacity-100 transition duration-1000 animate-pulse" />
              <input
                ref={inputRef}
                id="kreko-input"
                type="text"
                placeholder={placeholderText}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  backgroundColor: "rgba(10, 10, 10, 0.95)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  borderColor: "rgba(255, 255, 255, 0.6)", // Strong white border
                  color: "#ffffff",
                  borderWidth: "1.5px",
                  borderStyle: "solid",
                  boxShadow: "0 20px 60px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255,255,255,0.15) inset" // Deepest shadow + inner glow
                }}
                className="relative input-glow w-full rounded-2xl px-8 py-6 text-[18px] text-white font-semibold tracking-wide placeholder:text-[rgba(255,255,255,0.4)] placeholder:font-light outline-none focus:border-[rgba(255,255,255,1)] focus:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all"
              />
            </div>
          </div>

          {/* ── Execution Modes (Buttons) ─────────────────── */}
          <div
            style={{ transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.15s" }}
            className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${
              headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            {actions.map(({ mode, label, icon, description }) => (
              <ExecutionModeButton
                key={mode}
                label={label}
                icon={icon}
                description={description}
                onClick={() => handleAction(mode)}
                disabled={isLoading || !input.trim()}
                isActive={activeMode === mode}
              />
            ))}
          </div>

          {/* ── Output Card ───────────────────────────────── */}
          {showOutput && (
            <div
              className="output-card animate-slide-up rounded-2xl px-8 pt-8 min-h-[160px] max-h-[500px] overflow-y-auto mt-2"
              style={{
                backgroundColor: "rgba(5, 5, 5, 0.95)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
              }}
            >
              {activeMode && (
                <div className="mb-6 flex items-center gap-2 border-b border-[rgba(255,255,255,0.05)] pb-4">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-sm flex items-center gap-1.5"
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span className="grayscale opacity-70">{actions.find((a) => a.mode === activeMode)?.icon}</span>
                    {actions.find((a) => a.mode === activeMode)?.label}
                  </span>
                </div>
              )}

              <div className="text-[15px]" style={{ color: "rgba(255,255,255,0.85)" }}>
                {isLoading ? (
                  <ThinkingDots mode={activeMode} />
                ) : (
                  <TypingEffect text={output} speed={getTypingSpeed(activeMode)} />
                )}
              </div>
              
              {/* Bulletproof Spacer for empty background */}
              <div className="h-20 w-full shrink-0"></div>
            </div>
          )}

          {/* ── Quick Starts (Empty State) ────────────────── */}
          {/* UPGRADE 8: Empty State Fix */}
          {!showOutput && (
            <div
              style={{ transition: "all 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.25s" }}
              className={`flex flex-col items-center gap-5 mt-6 ${
                headerVisible ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-4 w-full max-w-[300px]">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white/20"></div>
                <span className="text-[10px] uppercase tracking-[0.15em] text-[rgba(255,255,255,0.4)] font-bold">Or execute a template</span>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white/20"></div>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {quickStarts.map((qs, i) => (
                  <QuickStartChip
                    key={i}
                    label={qs.label}
                    onClick={() => handleAction(qs.mode, qs.label)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}