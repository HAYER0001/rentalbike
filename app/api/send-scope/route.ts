import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  OWNER_EMAIL,
  BASE_PRICE,
  DESIGN_TIERS,
  FEATURES,
  AI_VISIBILITY_TIERS,
  EXTRA_OPTIONS,
  CARE_REWARD_LADDER,
  CARE_PLANS,
  DAY_OPTIONS,
  TIME_SLOTS,
  CONTACT_PREFERENCES,
  LABEL_MAP,
  CLOSE_UPSELLS,
  formatPrice,
  CARE_REWARD_TARGET,
  type BusinessType,
  type FeatureId,
  type DesignTierId,
  type AiVisibilityLevel,
  type CarePlanId,
} from "@/lib/config";

// ─── Helpers ───

function generateQuoteId(): string {
  const n = Math.floor(Math.random() * 900) + 100;
  return `HT-R-2026-${n}`;
}

function formatList(items: string[]): string {
  if (items.length === 0) return "—";
  return items.map((i) => `        <tr><td style="padding:2px 0;font-size:13px;color:#555">• ${i}</td></tr>`).join("\n");
}

function buildEmailHtml(body: {
  businessType: string;
  businessName: string;
  city: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  contactPreference: string;
  preferredDay: string;
  preferredSlot: string;
  designTier: string;
  enabledFeatures: FeatureId[];
  aiVisibilityLevel: AiVisibilityLevel;
  extras: string[];
  extraItems: number;
  extraLocations: number;
  timeline: string;
  grandTotal: number;
  estimateLow: number;
  estimateHigh: number;
  phase1Total: number;
  phase2Total: number;
  rewardLabel: string;
  rewardScope: string;
  avgBookingValue: number;
  extraBookingsPerMonth: number;
  carePlan: string;
  carePlanBilling: string;
  brandPaletteName: string;
  brandVibe: string;
  brandFontPairing: string;
  quoteId: string;
  referredBusinessName?: string;
  referredContact?: string;
  retainerOptIn: boolean;
  closeUpsells: string[];
}): string {
  const now = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "long",
    timeStyle: "short",
  });

  const btLabel =
    (LABEL_MAP[body.businessType as BusinessType]?.items ??
      "items") as string;

  const featuresTotal = body.enabledFeatures
    .map((fid) => FEATURES.find((f) => f.id === fid))
    .filter(Boolean)
    .reduce((s, f) => s + f!.price, 0);

  const aiTier = AI_VISIBILITY_TIERS.find((t) => t.id === body.aiVisibilityLevel);
  const aiVisibilityPrice = aiTier?.price ?? 0;

  const extrasTotal = body.extras
    .map((id) => EXTRA_OPTIONS.find((e) => e.id === id))
    .filter(Boolean)
    .reduce((s, e) => s + e!.price, 0);

  const designPrice =
    DESIGN_TIERS.find((t) => t.id === body.designTier as DesignTierId)?.price ?? 0;

  const scaleTotal =
    body.extraItems * 400 + body.extraLocations * 1500;

  const dayLabel =
    DAY_OPTIONS.find((d) => d.id === body.preferredDay)?.label ?? body.preferredDay;
  const slotLabel =
    TIME_SLOTS.find((s) => s.id === body.preferredSlot)?.label ?? body.preferredSlot;
  const contactLabel =
    CONTACT_PREFERENCES.find((c) => c.id === body.contactPreference)?.label ??
    body.contactPreference;

  return `<!doctype html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06)">

  <!-- Header -->
  <tr>
    <td style="background:#0E1116;padding:28px 32px;text-align:center">
      <h1 style="margin:0 0 4px;font-size:22px;font-weight:700;color:#E8E2D4;letter-spacing:-0.3px">Rental Scope Studio</h1>
      <p style="margin:0;font-size:13px;color:rgba(232,226,212,0.5)">by Hayer Technologies</p>
    </td>
  </tr>

  <!-- AT-A-GLANCE SUMMARY FOR CLOSING -->
  <tr>
    <td style="padding:24px 32px;background:#F9F9F9;border-bottom:1px solid #eee">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:12px;border-bottom:2px solid #E85D2A"><h3 style="margin:0;font-size:15px;font-weight:700;color:#0E1116">Close Summary</h3></td></tr>
        <tr><td style="padding:12px 0 0;font-size:14px;color:#333"><strong>Time:</strong> ${dayLabel} · ${slotLabel} (${contactLabel})</td></tr>
        <tr><td style="padding:8px 0 0;font-size:14px;color:#333"><strong>Phase 1 Value:</strong> ${formatPrice(body.phase1Total)}</td></tr>
        <tr><td style="padding:8px 0 0;font-size:14px;color:#333"><strong>Phase 2 Deferred:</strong> ${body.phase2Total > 0 ? formatPrice(body.phase2Total) : "None"}</td></tr>
        <tr><td style="padding:8px 0 0;font-size:14px;color:#333"><strong>Retainer Opt-in:</strong> ${body.retainerOptIn ? "<strong style='color:#2F6D4F'>YES (₹12k locked)</strong>" : "No"}</td></tr>
        <tr><td style="padding:8px 0 0;font-size:14px;color:#333"><strong>Referral given:</strong> ${body.referredBusinessName ? `<strong style='color:#2F6D4F'>YES</strong> (${body.referredBusinessName})` : "No"}</td></tr>
      </table>
    </td>
  </tr>

  <!-- Meeting + Contact -->
  <tr>
    <td style="padding:24px 32px;background:#E85D2A08;border-bottom:1px solid #eee">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:50%;vertical-align:top">
            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#999">Quote ID</p>
            <p style="margin:0;font-size:16px;font-weight:600;color:#0E1116;font-family:monospace">${body.quoteId}</p>
          </td>
          <td style="width:50%;vertical-align:top">
            <p style="margin:0 0 4px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;color:#999">Prospect</p>
            <p style="margin:0;font-size:14px;font-weight:600;color:#0E1116">${body.ownerName || "—"}</p>
            ${body.ownerPhone ? `<p style="margin:2px 0;font-size:12px;color:#555">📞 ${body.ownerPhone}</p>` : ""}
            ${body.ownerEmail ? `<p style="margin:2px 0;font-size:12px;color:#555">✉️ ${body.ownerEmail}</p>` : ""}
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Business info -->
  <tr>
    <td style="padding:24px 32px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:12px">
            <h2 style="margin:0;font-size:20px;font-weight:700;color:#0E1116">${body.businessName || "Your Business"}</h2>
            <p style="margin:2px 0 0;font-size:13px;color:#666">${body.city || "—"} · ${body.businessType} · ${8 + body.extraItems} ${btLabel}</p>
            <p style="margin:6px 0 0;font-size:12px;color:#888">🎨 Brand taste: <strong style="color:#555">${body.brandPaletteName}</strong> palette · ${body.brandVibe === "light" ? "Light" : "Dark"} theme · ${body.brandFontPairing} typography</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- Itemized scope -->
  <tr>
    <td style="padding:0 32px 24px">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:12px;border-bottom:2px solid #0E1116"><h3 style="margin:0;font-size:14px;font-weight:700;color:#0E1116">Scope breakdown</h3></td></tr>

        <!-- Base -->
        <tr><td style="padding:10px 0 4px"><table width="100%"><tr>
          <td style="font-size:13px;color:#333">Base package</td>
          <td style="font-size:13px;font-weight:600;color:#E85D2A;text-align:right">${formatPrice(BASE_PRICE)}</td>
        </tr></table></td></tr>

        <!-- Design -->
        ${designPrice > 0 ? `<tr><td style="padding:4px 0"><table width="100%"><tr>
          <td style="font-size:13px;color:#555">Design: ${DESIGN_TIERS.find((t) => t.id === body.designTier as DesignTierId)?.label}</td>
          <td style="font-size:13px;color:#555;text-align:right">+${formatPrice(designPrice)}</td>
        </tr></table></td></tr>` : ""}

        <!-- Features -->
        ${featuresTotal > 0 ? `<tr><td style="padding:4px 0"><table width="100%"><tr>
          <td style="font-size:13px;color:#555">${body.enabledFeatures.length} feature(s)</td>
          <td style="font-size:13px;color:#555;text-align:right">+${formatPrice(featuresTotal)}</td>
        </tr></table></td></tr>
        <tr><td style="padding:0 0 4px 12px">
          <table cellpadding="0" cellspacing="0">${formatList(body.enabledFeatures.map((fid) => FEATURES.find((f) => f.id === fid)?.label ?? fid))}</table>
        </td></tr>` : ""}

        <!-- AI Visibility Launch Package -->
        ${body.aiVisibilityLevel > 0 && aiTier ? `<tr><td style="padding:4px 0"><table width="100%"><tr>
          <td style="font-size:13px;color:#555">${aiTier.icon} AI Visibility Launch — ${aiTier.label}</td>
          <td style="font-size:13px;color:#555;text-align:right">+${formatPrice(aiVisibilityPrice)}</td>
        </tr></table></td></tr>
        <tr><td style="padding:0 0 4px 12px">
          <table cellpadding="0" cellspacing="0">${formatList(aiTier.deliverables)}</table>
        </td></tr>` : ""}

        <!-- Extras -->
        ${extrasTotal > 0 ? `<tr><td style="padding:4px 0"><table width="100%"><tr>
          <td style="font-size:13px;color:#555">Extra services</td>
          <td style="font-size:13px;color:#555;text-align:right">+${formatPrice(extrasTotal)}</td>
        </tr></table></td></tr>` : ""}

        <!-- Scale -->
        ${scaleTotal > 0 ? `<tr><td style="padding:4px 0"><table width="100%"><tr>
          <td style="font-size:13px;color:#555">Scale: ${body.extraItems} extra items + ${body.extraLocations} extra locations</td>
          <td style="font-size:13px;color:#555;text-align:right">+${formatPrice(scaleTotal)}</td>
        </tr></table></td></tr>` : ""}

        <!-- Fast-track -->
        ${body.timeline === "fastTrack" ? `<tr><td style="padding:4px 0"><table width="100%"><tr>
          <td style="font-size:13px;color:#555">Fast-track (+15%)</td>
          <td style="font-size:13px;color:#555;text-align:right">Applied</td>
        </tr></table></td></tr>` : ""}

        <!-- Close Upsells -->
        ${body.closeUpsells.length > 0 ? body.closeUpsells.map(uid => {
          const u = CLOSE_UPSELLS.find(x => x.id === uid);
          if (!u) return "";
          return `<tr><td style="padding:4px 0"><table width="100%"><tr>
            <td style="font-size:13px;color:#555">${u.label}</td>
            <td style="font-size:13px;color:#555;text-align:right">+${formatPrice(u.price)}</td>
          </tr></table></td></tr>`;
        }).join("") : ""}

        <!-- Grand total -->
        <tr><td style="padding:12px 0 4px;border-top:2px solid #0E1116;margin-top:8px"><table width="100%"><tr>
          <td style="font-size:16px;font-weight:700;color:#0E1116">Phase 1 Total</td>
          <td style="font-size:20px;font-weight:700;color:#E85D2A;text-align:right">${formatPrice(body.phase1Total)}</td>
        </tr></table></td></tr>
        <tr><td style="font-size:11px;color:#999;text-align:right;padding-top:2px">Est. range ${formatPrice(body.estimateLow)}–${formatPrice(body.estimateHigh)}</td></tr>

        <!-- Timeline -->
        <tr><td style="padding-top:8px;font-size:12px;color:#666">Timeline: ${body.timeline === "fastTrack" ? "Fast-track (2 weeks)" : "Standard (3–4 weeks)"}</td></tr>

        <!-- Post-launch care plan -->
        ${body.carePlan && body.carePlan !== "none" ? (() => {
          const plan = CARE_PLANS.find((p) => p.id === body.carePlan as CarePlanId);
          if (!plan) return "";
          const planPrice = body.carePlanBilling === "annual" ? `₹${plan.annualPrice.toLocaleString("en-IN")}/yr` : `₹${plan.monthlyPrice.toLocaleString("en-IN")}/mo`;
          return `<tr><td style="padding:8px 0 0;font-size:13px;color:#555">
            Post-launch care: <strong>${plan.label}</strong> — ${planPrice} (${body.carePlanBilling})
          </td></tr>`;
        })() : ""}
      </table>
    </td>
  </tr>

  <!-- Reward -->
  ${body.rewardLabel ? `
  <tr>
    <td style="padding:0 32px 24px">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:${body.grandTotal >= 40000 ? "#FFF8E7" : "#F0F9F0"};border-radius:12px;padding:16px">
        <tr>
          <td style="font-size:14px;font-weight:700;${body.grandTotal >= 40000 ? "color:#E0A536" : "color:#2F6D4F"}">
            ${body.grandTotal >= 40000 ? "🏆" : "🎁"} ${body.rewardLabel}
          </td>
        </tr>
        <tr><td style="font-size:12px;color:#555;padding-top:6px;line-height:1.5">${body.rewardScope}</td></tr>
      </table>
    </td>
  </tr>` : ""}

  <!-- Referral -->
  ${body.referredBusinessName ? `
  <tr>
    <td style="padding:0 32px 24px">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;border-radius:12px;padding:16px;border-left:4px solid #3B82F6">
        <tr>
          <td style="font-size:14px;font-weight:700;color:#1E3A8A">
            🤝 Client Referral Registered
          </td>
        </tr>
        <tr>
          <td style="font-size:12px;color:#4B5563;padding-top:6px;line-height:1.5">
            <strong>Referred Business:</strong> ${body.referredBusinessName}<br/>
            <strong>Contact:</strong> ${body.referredContact || "—"}<br/>
            <em>Note: 25% discount applies to this build when the referred business becomes a paying client.</em>
          </td>
        </tr>
      </table>
    </td>
  </tr>` : ""}

  <!-- Quote info -->
  <tr>
    <td style="padding:0 32px 24px;font-size:11px;color:#999">
      Quote ID: <strong>${body.quoteId}</strong> · Valid for 7 days · Generated ${now}
    </td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="background:#0E1116;padding:20px 32px;text-align:center">
      <p style="margin:0;font-size:12px;color:rgba(232,226,212,0.4)">
        Hayer Technologies — info@hayertechnologies.tech — +91 7877514132
      </p>
    </td>
  </tr>

</table>
</td></tr></table>
</body>
</html>`;
}

// ─── API Route ───

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      businessType,
      businessName,
      city,
      ownerName,
      ownerPhone,
      ownerEmail,
      contactPreference,
      preferredDay,
      preferredSlot,
      designTier,
      enabledFeatures,
      aiVisibilityLevel,
      extras,
      extraItems,
      extraLocations,
      timeline,
      grandTotal,
      estimateLow,
      estimateHigh,
      rewardLabel,
      rewardScope,
      avgBookingValue,
      extraBookingsPerMonth,
      carePlan,
      carePlanBilling,
      brandPaletteName,
      brandVibe,
      brandFontPairing,
      referredBusinessName,
      referredContact,
      quoteId,
      phase1Total,
      phase2Total,
      retainerOptIn,
      closeUpsells,
    } = body;

    const timestamp = new Date().toISOString();
    const useFormSubmit = process.env.FORM_SUBMIT_FALLBACK === "true";

    const subject = `🏢 New ${businessType} Scope — ${businessName || "Your Business"} — ${formatPrice(phase1Total)} — Meet: ${preferredDay || "—"} ${preferredSlot || "—"}`;

    const htmlBody = buildEmailHtml({
      businessType: businessType || "—",
      businessName: businessName || "",
      city: city || "",
      ownerName: ownerName || "",
      ownerPhone: ownerPhone || "",
      ownerEmail: ownerEmail || "",
      contactPreference: contactPreference || "",
      preferredDay: preferredDay || "",
      preferredSlot: preferredSlot || "",
      designTier: designTier || "standard",
      enabledFeatures: enabledFeatures || [],
      aiVisibilityLevel: aiVisibilityLevel || 0,
      extras: extras || [],
      extraItems: extraItems || 0,
      extraLocations: extraLocations || 0,
      timeline: timeline || "standard",
      grandTotal: grandTotal || 0,
      estimateLow: estimateLow || 0,
      estimateHigh: estimateHigh || 0,
      phase1Total: phase1Total || 0,
      phase2Total: phase2Total || 0,
      rewardLabel: rewardLabel || "",
      rewardScope: rewardScope || "",
      avgBookingValue: avgBookingValue || 0,
      extraBookingsPerMonth: extraBookingsPerMonth || 0,
      carePlan: carePlan || "none",
      carePlanBilling: carePlanBilling || "monthly",
      brandPaletteName: brandPaletteName || "Sunset Ember",
      brandVibe: brandVibe || "dark",
      brandFontPairing: brandFontPairing || "Modern",
      quoteId,
      referredBusinessName,
      referredContact,
      retainerOptIn: !!retainerOptIn,
      closeUpsells: closeUpsells || [],
    });

    // ── Primary: Resend ──
    if (!useFormSubmit) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        // No key configured — fall through to FormSubmit or mailto
        console.warn("[send-scope] RESEND_API_KEY not set. Falling back.");
        throw new Error("RESEND_API_KEY not configured");
      }

      const resend = new Resend(apiKey);
      const { error } = await resend.emails.send({
        from: "Rental Scope Studio <onboarding@resend.dev>",
        // Once hayertechnologies.tech is verified in Resend, change from to:
        // from: "Rental Scope Studio <scope@hayertechnologies.tech>",
        to: OWNER_EMAIL,
        replyTo: ownerEmail || OWNER_EMAIL,
        subject,
        html: htmlBody,
      });

      if (error) {
        console.error("[send-scope] Resend error:", error);
        throw error;
      }

      console.log("[send-scope] Sent via Resend:", { quoteId, businessName, grandTotal });
      return NextResponse.json({ ok: true, quoteId });
    }

    // ── Fallback: FormSubmit ──
    console.log("[send-scope] Using FormSubmit fallback");

    const formRes = await fetch("https://formsubmit.co/ajax/info@hayertechnologies.tech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _subject: subject,
        _template: "table",
        _captcha: "false",
        _honey: "",
        _autoresponse: "Thank you! We've received your website scope and will reach out at your preferred time.",
        html: htmlBody,
        quoteId,
        timestamp,
      }),
    });

    if (!formRes.ok) {
      const text = await formRes.text();
      console.error("[send-scope] FormSubmit error:", text);
      throw new Error(`FormSubmit failed: ${text}`);
    }

    console.log("[send-scope] Sent via FormSubmit:", { quoteId, businessName, grandTotal });
    return NextResponse.json({ ok: true, quoteId });
  } catch (err) {
    console.error("[send-scope] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to send scope" },
      { status: 500 },
    );
  }
}
