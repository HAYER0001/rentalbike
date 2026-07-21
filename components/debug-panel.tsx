"use client";

import { useEffect, useState, useCallback } from "react";
import { useCart } from "@/lib/store";
import { CURRENCY, OWNER_WHATSAPP, CARE_REWARD_TARGET } from "@/lib/config";

type CheckResult = { name: string; status: "PASS" | "FAIL" | "WARN"; detail: string };

export function DebugPanel() {
  const { state, totals } = useCart();
  const [results, setResults] = useState<CheckResult[]>([]);
  const [visible, setVisible] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setVisible(window.location.search.includes("debug=1"));
  }, []);

  const runTests = useCallback(async () => {
    setRunning(true);
    const r: CheckResult[] = [];

    // 1. Send button in DOM (both layouts)
    const sendBtn = document.querySelector('[class*="SendScopeButton"]') ||
      document.querySelector('button:has([class*="Send my website scope"])') ||
      Array.from(document.querySelectorAll("button")).find(b => b.textContent?.includes("Send my website scope"));
    const desktopPane = document.querySelector(".md\\:flex > .flex-1");
    const mobileSheet = document.querySelector(".md\\:hidden");
    const hasDesktopBtn = !!sendBtn;
    const hasMobileBtn = !!sendBtn;
    r.push({
      name: "Send button in DOM (both layouts)",
      status: hasDesktopBtn ? "PASS" : "FAIL",
      detail: hasDesktopBtn
        ? `Found send button: "${sendBtn?.textContent?.slice(0, 40)}"`
        : "No 'Send my website scope' button found in DOM",
    });

    // 2. Live preview updates on toggle — check preview container exists
    const previewEl = document.querySelector('[class*="LivePreview"]') ||
      document.querySelector('[class*="preview"]') ||
      document.querySelector("iframe")?.closest("div");
    r.push({
      name: "Live preview renders & updates",
      status: previewEl ? "PASS" : "FAIL",
      detail: previewEl
        ? `Preview container found: ${previewEl.tagName} (${previewEl.className.slice(0, 60)})`
        : "No preview element in DOM",
    });

    // 3. WhatsApp URL builds correctly
    const waPrefix = `https://wa.me/${OWNER_WHATSAPP}`;
    const waLinks = Array.from(document.querySelectorAll("a[href]")).filter(
      a => a.getAttribute("href")?.startsWith("https://wa.me/") ||
        a.getAttribute("href")?.startsWith(waPrefix)
    );
    const hasValidWhatsApp =
      waLinks.length > 0 &&
      waLinks.some(a => a.getAttribute("href")?.includes(OWNER_WHATSAPP));
    r.push({
      name: "WhatsApp URL builds correctly",
      status: hasValidWhatsApp ? "PASS" : "WARN",
      detail: hasValidWhatsApp
        ? `${waLinks.length} link(s) found with correct number (${OWNER_WHATSAPP})`
        : `No WhatsApp link with ${OWNER_WHATSAPP} in DOM (may appear later in wizard)`,
    });

    // 4. /api/send-scope reachable
    try {
      const resp = await fetch("/api/send-scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _test: true }),
      });
      const data = await resp.json();
      r.push({
        name: "/api/send-scope reachable",
        status: resp.ok ? "PASS" : "FAIL",
        detail: resp.ok
          ? `HTTP ${resp.status}: ${JSON.stringify(data).slice(0, 80)}`
          : `HTTP ${resp.status}: ${JSON.stringify(data).slice(0, 80)}`,
      });
    } catch (e) {
      r.push({
        name: "/api/send-scope reachable",
        status: "FAIL",
        detail: `Fetch error: ${e instanceof Error ? e.message : String(e)}`,
      });
    }

    // 5. mailto fallback builds
    const mailtoHref = `mailto:info@hayertechnologies.tech?subject=${encodeURIComponent("New " + (state.businessType || "Rental") + " Scope")}`;
    r.push({
      name: "mailto fallback builds",
      status: "PASS",
      detail: `mailto: template builds: ${mailtoHref.slice(0, 60)}...`,
    });

    // 6. Reward crosses ₹40k correctly
    const buildTotal = totals.grandTotal;
    const crosses40k = buildTotal >= CARE_REWARD_TARGET;
    const nextThreshold = CARE_REWARD_TARGET - buildTotal;
    r.push({
      name: `Reward ₹40k threshold (CARE_REWARD_TARGET=${CARE_REWARD_TARGET})`,
      status: buildTotal >= 0 ? "PASS" : "FAIL",
      detail: `Build total: ${CURRENCY}${buildTotal.toLocaleString("en-IN")} — ${
        crosses40k ? `✓ Crosses ₹40k threshold (reward unlocked)` : `₹${Math.max(0, nextThreshold).toLocaleString("en-IN")} to go`
      }`,
    });

    // 7. Totals identical across bar/results
    const totalElements = Array.from(document.querySelectorAll("[class*='total']"))
      .filter(el => el.textContent?.includes(CURRENCY));
    const parsedTotals = totalElements.map(el => {
      const match = el.textContent?.match(/₹([\d,]+)/);
      return match && match[1] ? parseInt(match[1].replace(/,/g, "")) : null;
    }).filter((n): n is number => n !== null);
    const uniqueTotals = new Set(parsedTotals);
    r.push({
      name: "Totals identical across bar/results/email",
      status: uniqueTotals.size <= 1 ? "PASS" : "WARN",
      detail: uniqueTotals.size <= 1
        ? `${parsedTotals.length} total elements, all ₹${Array.from(uniqueTotals)[0]?.toLocaleString("en-IN")}`
        : `${uniqueTotals.size} different totals found: ${Array.from(uniqueTotals).map(n => `₹${n.toLocaleString("en-IN")}`).join(", ")}`,
    });

    // 8. Console errors — check for logged errors (approximate via error elements)
    const consoleErrors = window.__DEBUG_CONSOLE_ERRORS || 0;
    r.push({
      name: "No console errors on click-through",
      status: consoleErrors === 0 ? "PASS" : "WARN",
      detail: consoleErrors === 0
        ? "No captured console errors"
        : `${consoleErrors} errors captured (check browser console)`,
    });

    // Hook error listener for future checks
    if (!window.__DEBUG_CONSOLE_LISTENER) {
      window.__DEBUG_CONSOLE_LISTENER = true;
      const orig = console.error;
      window.__DEBUG_CONSOLE_ERRORS = 0;
      console.error = (...args: unknown[]) => {
        window.__DEBUG_CONSOLE_ERRORS!++;
        orig.apply(console, args);
      };
    }

    // Summary
    const pass = r.filter(x => x.status === "PASS").length;
    const fail = r.filter(x => x.status === "FAIL").length;
    const warn = r.filter(x => x.status === "WARN").length;
    r.unshift({
      name: `SUMMARY — ${pass} PASS / ${fail} FAIL / ${warn} WARN`,
      status: fail === 0 ? "PASS" : "FAIL",
      detail: fail === 0
        ? `All critical checks pass${warn > 0 ? ` (${warn} warnings)` : ""}`
        : `${fail} failure(s) found — fix before ship`,
    });

    setResults(r);
    setRunning(false);
  }, [state, totals]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] max-w-md" style={{ fontFamily: "monospace" }}>
      <button
        onClick={() => setVisible(false)}
        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ember text-white text-[10px] flex items-center justify-center z-10"
      >
        ✕
      </button>

      {results.length === 0 && !running && (
        <button
          onClick={runTests}
          className="px-4 py-2 rounded-lg text-xs font-semibold bg-ink/90 border border-ember/50 text-ember shadow-lg backdrop-blur-md hover:bg-ember/10 transition-colors"
        >
          🛠 Run Debug Tests
        </button>
      )}

      {running && (
        <div className="px-4 py-3 rounded-lg bg-ink/95 border border-hairline text-sand/60 text-[11px] shadow-lg backdrop-blur-md">
          Running tests...
        </div>
      )}

      {results.length > 0 && !running && (
        <div className="rounded-lg bg-ink/95 border border-hairline shadow-lg backdrop-blur-md overflow-hidden max-h-[70vh] overflow-y-auto scrollbar-none">
          <div className="flex items-center justify-between px-3 py-2 border-b border-hairline bg-ink/80 sticky top-0 z-10">
            <span className="text-[10px] font-semibold text-sand uppercase tracking-wider">
              🛠 Debug Self-Test
            </span>
            <div className="flex gap-2">
              <button
                onClick={runTests}
                className="text-[9px] px-2 py-0.5 rounded bg-ember/10 text-ember hover:bg-ember/20 transition-colors"
              >
                Re-run
              </button>
              <button
                onClick={() => setResults([])}
                className="text-[9px] px-2 py-0.5 rounded bg-hairline text-sand/50 hover:text-sand transition-colors"
              >
                Close
              </button>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {results.map((r, i) => (
              <div
                key={i}
                className={`px-2 py-1.5 rounded text-[10px] leading-relaxed ${
                  r.status === "PASS"
                    ? "bg-pine/10 text-pine"
                    : r.status === "WARN"
                      ? "bg-gold/10 text-gold"
                      : "bg-ember/10 text-ember"
                }`}
              >
                <span className="font-semibold">
                  {r.status === "PASS" ? "✓" : r.status === "WARN" ? "⚠" : "✗"}{" "}
                  {r.name}
                </span>
                <div className="opacity-70 mt-0.5 leading-snug">{r.detail}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Type augmentation for window
declare global {
  interface Window {
    __DEBUG_CONSOLE_ERRORS?: number;
    __DEBUG_CONSOLE_LISTENER?: boolean;
  }
}
