// main.js — لاظهار الكتب، السلة، ومودال الدفع (متوافق مع index.html الأصلي)
document.addEventListener("DOMContentLoaded", () => {
  // ----- عناصر HTML (نتحقق أولاً من وجودها) -----
  const grid = document.getElementById("grid");
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");
  const modalBuy = document.getElementById("modalBuy");
  const modalCancel = document.getElementById("modalCancel");
  const closeModal = document.getElementById("closeModal");

  const paymentModal = document.getElementById("paymentModal");
  const paymentModalTitle = document.getElementById("paymentModalTitle");
  const closePaymentModal = document.getElementById("closePaymentModal");
  const confirmPaymentBtn = document.getElementById("confirmPaymentBtn");
  const cancelPaymentBtn = document.getElementById("cancelPaymentBtn");
  const demoPay = document.getElementById("demoPay");
  const searchBtn = document.getElementById("searchBtn");

  if (!grid) {
    console.error("main.js: element #grid not found. تأكدي أن index.html يحتوي على <div id=\"grid\">");
    return;
  }

  // ----- بيانات كتب تجريبية (قابلة للتعديل) -----
  const books = [
    {id:1, title:"Le Petit Prince", author:"Antoine de Saint-Exupéry", price:9.99, img:"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f", lang:"FR"},
    {id:2, title:"Pride and Prejudice", author:"Jane Austen", price:12.5, img:"https://images.unsplash.com/photo-1528207776546-365bb710ee93", lang:"EN"},
    {id:3, title:"Les Misérables", author:"Victor Hugo", price:14.0, img:"https://images.unsplash.com/photo-1512820790803-83ca734da794", lang:"FR"},
    {id:4, title:"1984", author:"George Orwell", price:11.0, img:"https://images.unsplash.com/photo-1544938615-9f2b8af9a5c1", lang:"EN"},
    {id:5, title:"Dune", author:"Frank Herbert", price:15.0, img:"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c", lang:"EN"},
    {id:6, title:"Madame Bovary", author:"Gustave Flaubert", price:10.0, img:"https://images.unsplash.com/photo-1519681393784-d120267933ba", lang:"FR"}
  ];

  // ----- toast داخلي جميل بديل للـ alert -----
  function showToast(message, type = "info") {
    const t = document.createElement("div");
    t.className = "fixed right-6 top-6 z-50 p-3 rounded shadow-lg";
    t.style.background = type === "success" ? "#064e3b" : "#0f172a";
    t.style.color = "white";
    t.style.borderLeft = "4px solid #caa84b";
    t.innerText = message;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("hide"), 10);
    setTimeout(() => t.remove(), 3800);
  }

  // ----- رندرة الكتب داخل #grid -----
  function renderBooks(list = books) {
    grid.innerHTML = "";
    list.forEach(book => {
      const article = document.createElement("article");
      article.className = "rounded-xl glass p-4 card-3d transform hover:scale-105 transition cursor-pointer";
      article.dataset.id = book.id;
      article.innerHTML = `
        <div class="relative">
          <img loading="lazy" src="${book.img}" class="w-full h-52 object-cover rounded-md" alt="${escapeHtml(book.title)}">
          <div class="absolute left-3 top-3 px-2 py-1 rounded bg-black/40 text-xs">${book.lang}</div>
        </div>
        <h3 class="mt-3 font-semibold">${escapeHtml(book.title)}</h3>
        <p class="text-sm text-zinc-300">${escapeHtml(book.author)}</p>
        <div class="mt-4 flex items-center justify-between">
          <div class="text-[var(--gold)] font-bold">${book.price.toFixed(2)} €</div>
          <div class="flex gap-2">
            <button class="btn-detail px-3 py-1 rounded border border-zinc-700 text-sm">Détails</button>
            <button class="btn-add px-3 py-1 rounded bg-[var(--gold)] text-black text-sm font-semibold">Ajouter au panier</button>
            <button class="btn-pay px-3 py-1 rounded bg-green-600 text-white text-sm">Paiement</button>
          </div>
        </div>`;
      grid.appendChild(article);
    });
    attachBookListeners();
  }

  // ----- حماية النص (بسيطة) -----
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  // ----- ربط الأحداث -----
  function attachBookListeners() {
    grid.querySelectorAll(".btn-detail").forEach(btn => {
      btn.onclick = (e) => {
        const art = e.target.closest("article");
        const book = books.find(b => b.id === Number(art.dataset.id));
        openDetailModal(book);
      };
    });
    grid.querySelectorAll(".btn-add").forEach(btn => {
      btn.onclick = (e) => {
        const art = e.target.closest("article");
        const book = books.find(b => b.id === Number(art.dataset.id));
        addToCart(book);
      };
    });
    grid.querySelectorAll(".btn-pay").forEach(btn => {
      btn.onclick = (e) => {
        const art = e.target.closest("article");
        const book = books.find(b => b.id === Number(art.dataset.id));
        openPaymentModal(book);
      };
    });
  }

  // ----- سلة المشتريات (single declaration) -----
  function getCart() {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
    catch { return []; }
  }
  function saveCart(cart) { localStorage.setItem("cart", JSON.stringify(cart)); }

  function addToCart(book) {
    const cart = getCart();
    cart.push(book);
    saveCart(cart);
    showToast(`${book.title} ajouté au panier`, "success");
  }

  // ----- Modal التفاصيل -----
  function openDetailModal(book) {
    if (!modal) return;
    modalTitle.textContent = book.title;
    modalBody.innerHTML = `
      <div class="md:flex gap-6">
        <img src="${book.img}" class="w-full md:w-48 h-48 object-cover rounded-md">
        <div>
          <p class="text-zinc-300">${book.author}</p>
          <p class="mt-4 font-semibold text-[var(--gold)]">${book.price.toFixed(2)} €</p>
          <p class="mt-3 text-sm text-zinc-400">Description courte du livre — parfait pour lecteurs exigeants.</p>
          <button id="detailBuy" class="mt-4 px-4 py-2 rounded bg-green-600 text-white font-semibold">Acheter</button>
        </div>
      </div>`;
    modal.classList.remove("hidden");
    const detailBuy = document.getElementById("detailBuy");
    if (detailBuy) {
      detailBuy.onclick = () => { modal.classList.add("hidden"); openPaymentModal(book); };
    }
  }

  if (closeModal) closeModal.onclick = () => modal.classList.add("hidden");
  if (modalCancel) modalCancel.onclick = () => modal.classList.add("hidden");

  // ═══════════════════════════════════════════════════════════════════════
  //  outer scope variable to hold last payload
  // ═══════════════════════════════════════════════════════════════════════
  let lastPayload = null;

  // ═══════════════════════════════════════════════════════════════════════
  //  FRAUD RESULT MODAL
  // ═══════════════════════════════════════════════════════════════════════
  function showFraudResult(data, cardType) {
    const old = document.getElementById("fraudResultModal");
    if (old) old.remove();

    const d = data.decision;
    const decisionColor = d === "OK" ? "#16a34a" : d === "SUSPICIOUS" ? "#d97706" : "#dc2626";
    const decisionBg    = d === "OK" ? "rgba(22,163,74,0.1)" : d === "SUSPICIOUS" ? "rgba(217,119,6,0.1)" : "rgba(220,38,38,0.1)";
    const decisionIcon  = d === "OK" ? "✅" : d === "SUSPICIOUS" ? "⚠️" : "🚫";

    const prob   = data.probability_pct !== undefined ? data.probability_pct.toFixed(2) : (data.probability * 100).toFixed(2);
    const ftProb = data.ft_prob      !== undefined ? (data.ft_prob * 100).toFixed(2)      : "—";
    const aiProb = data.autoint_prob !== undefined ? (data.autoint_prob * 100).toFixed(2) : "—";
    const conf   = data.confidence_pct !== undefined ? data.confidence_pct.toFixed(1)     : "—";
    const ms     = data.inference_ms   !== undefined ? data.inference_ms                  : "—";
    const thr    = data.model && data.model.threshold !== undefined ? data.model.threshold.toFixed(4) : "—";

    const cardLabel = cardType.charAt(0).toUpperCase() + cardType.slice(1);
    const riskWidth = Math.min(100, parseFloat(prob));
    const riskColor = riskWidth < 30 ? "#16a34a" : riskWidth < 60 ? "#d97706" : "#dc2626";

    // SHAP — contributions + explanations
    let shapHtml = "";
    if (data.shap) {
      const contribs = data.shap.contributions || [];
      const exps     = data.shap.explanations  || [];
      const baseVal  = data.shap.base_value !== undefined ? data.shap.base_value.toFixed(5) : "—";

      let contribRows = "";
      if (contribs.length > 0) {
        const maxAbs = Math.max(...contribs.map(f => Math.abs(f.shap)), 0.001);
        contribRows = contribs.map(f => {
          const pct  = Math.round((Math.abs(f.shap) / maxAbs) * 100);
          const col  = f.direction === "risk" ? "#dc2626" : "#16a34a";
          const sign = f.shap > 0 ? "▲" : "▼";
          const dot  = f.direction === "risk" ? "#dc2626" : "#16a34a";
          return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <div style="width:8px;height:8px;border-radius:50%;background:${dot};flex-shrink:0;"></div>
            <div style="flex:1;font-size:12px;color:#d4d4d8;">${f.label}</div>
            <div style="width:80px;background:#1a1a1a;border-radius:4px;height:7px;overflow:hidden;flex-shrink:0;">
              <div style="width:${pct}%;height:100%;background:${col};border-radius:4px;"></div>
            </div>
            <div style="width:60px;font-size:11px;color:${col};text-align:right;font-weight:600;flex-shrink:0;">${sign} ${Math.abs(f.shap).toFixed(4)}</div>
          </div>`;
        }).join("");
      }

      let expRows = "";
      if (exps.length > 0) {
        expRows = exps.map(e => {
          const [type, text] = e;
          const col  = type === "risk" ? "#dc2626" : type === "warn" ? "#d97706" : "#16a34a";
          const icon = type === "risk" ? "🔴" : type === "warn" ? "🟡" : "🟢";
          return `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:7px;">
            <span style="font-size:12px;flex-shrink:0;">${icon}</span>
            <span style="font-size:12px;color:#d4d4d8;line-height:1.4;">${text}</span>
          </div>`;
        }).join("");
      }

      shapHtml = `
        <div style="margin-top:16px;">
          <div style="font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">🔍 Contributions SHAP — Facteurs de risque</div>
          <div style="background:#111;border:1px solid #27272a;border-radius:10px;padding:14px;margin-bottom:10px;">
            ${contribRows || '<div style="font-size:12px;color:#71717a;">Aucune contribution disponible</div>'}
          </div>
          ${expRows ? `
          <div style="font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Explication du modèle</div>
          <div style="background:#111;border:1px solid #27272a;border-radius:10px;padding:14px;margin-bottom:10px;">
            ${expRows}
          </div>` : ""}
        </div>`;
    }

    const overlay = document.createElement("div");
    overlay.id = "fraudResultModal";
    overlay.style.cssText = "position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);padding:16px;";

    overlay.innerHTML = `
      <div style="background:#0b0b0b;border:1px solid #27272a;border-radius:16px;max-width:500px;width:100%;padding:26px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;max-height:90vh;overflow-y:auto;">

        <!-- Decision banner -->
        <div style="background:${decisionBg};border:1px solid ${decisionColor}55;border-radius:10px;padding:14px 18px;margin-bottom:18px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:26px;">${decisionIcon}</span>
          <div>
            <div style="font-size:17px;font-weight:700;color:${decisionColor};">${d}</div>
            <div style="font-size:13px;color:#d4d4d8;margin-top:2px;">${data.message || ""}</div>
          </div>
        </div>

        <!-- Risk bar -->
        <div style="margin-bottom:18px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;">Score de risque fraud</span>
            <span style="font-size:14px;font-weight:700;color:${riskColor};">${prob}%</span>
          </div>
          <div style="background:#1a1a1a;border-radius:8px;height:10px;overflow:hidden;">
            <div style="width:${riskWidth}%;height:100%;background:linear-gradient(90deg,${riskColor}88,${riskColor});border-radius:8px;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;margin-top:3px;">
            <span style="font-size:10px;color:#52525b;">0% Sûr</span>
            <span style="font-size:10px;color:#52525b;">100% Fraude</span>
          </div>
        </div>

        <!-- Stats grid -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">
          <div style="background:#111;border:1px solid #27272a;border-radius:10px;padding:11px 13px;">
            <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">💳 Carte détectée</div>
            <div style="font-size:15px;font-weight:600;color:#e4e4e7;margin-top:4px;">${cardLabel}</div>
          </div>
          <div style="background:#111;border:1px solid #27272a;border-radius:10px;padding:11px 13px;">
            <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">🎯 Confiance</div>
            <div style="font-size:15px;font-weight:600;color:#e4e4e7;margin-top:4px;">${conf}%</div>
          </div>
          <div style="background:#111;border:1px solid #27272a;border-radius:10px;padding:11px 13px;">
            <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">FT-Transformer</div>
            <div style="font-size:15px;font-weight:600;color:#caa84b;margin-top:4px;">${ftProb}%</div>
          </div>
          <div style="background:#111;border:1px solid #27272a;border-radius:10px;padding:11px 13px;">
            <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">AutoInt</div>
            <div style="font-size:15px;font-weight:600;color:#caa84b;margin-top:4px;">${aiProb}%</div>
          </div>
          <div style="background:#111;border:1px solid #27272a;border-radius:10px;padding:11px 13px;grid-column:span 2;">
            <div style="font-size:10px;color:#71717a;text-transform:uppercase;letter-spacing:1px;">⚡ Temps d'inférence</div>
            <div style="font-size:15px;font-weight:600;color:#e4e4e7;margin-top:4px;">${ms} ms</div>
          </div>
        </div>

        <!-- Threshold row -->
        <div style="background:#111;border:1px solid #27272a;border-radius:8px;padding:9px 13px;margin-bottom:14px;font-size:12px;color:#71717a;display:flex;gap:16px;flex-wrap:wrap;">
          <span>Seuil XGBoost : <strong style="color:#caa84b;">${thr}</strong></span>
          <span>Prob. brute : <strong style="color:#caa84b;">${(parseFloat(prob)/100).toFixed(6)}</strong></span>
        </div>

        <!-- SHAP -->
        ${shapHtml}

        <!-- buttons row with Raw Features button -->
        <div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;">
          ${d === "SUSPICIOUS" || d === "BLOCK" ? `<button id="showRawFeatures" style="padding:10px 18px;border-radius:8px;background:#18181b;color:#caa84b;font-weight:600;border:1px solid #caa84b;cursor:pointer;font-size:13px;">🔬 Why this decision?</button>` : ""}
          <button id="closeFraudResult" style="padding:10px 26px;border-radius:8px;background:#caa84b;color:#000;font-weight:700;border:none;cursor:pointer;font-size:14px;">${d === "BLOCK" ? "Fermer" : "Valider"}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.getElementById("closeFraudResult").onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    // why this decision modal (only for SUSPICIOUS/BLOCK)
    const rawBtn = document.getElementById("showRawFeatures");
    if (rawBtn) rawBtn.onclick = () => {
      const old2 = document.getElementById("rawFeaturesModal");
      if (old2) old2.remove();

      if (!lastPayload) { showToast("No transaction data available.", "info"); return; }
      const p = lastPayload;
      const decisionColorMap = { OK: "#16a34a", SUSPICIOUS: "#d97706", BLOCK: "#dc2626" };
      const dc = decisionColorMap[d] || "#caa84b";

      // verdict helper
      function verdict(level) {
        if (level === "high")    return { icon: "🔴", label: "High Risk",  color: "#dc2626" };
        if (level === "warn")    return { icon: "⚠️", label: "Suspicious", color: "#d97706" };
        return                          { icon: "✅", label: "Normal",     color: "#16a34a" };
      }

      // evaluate each feature
      const cvvDigits = (p.cvv || "").replace(/\D/g, "");
      const cvvLevel  = cvvDigits.length < 3 ? "warn"
                      : new Set(cvvDigits.split("")).size === 1 ? "warn" : "ok";

      const cardTypeLevel = ["gift","prepaid","virtual","unknown"].includes(p.card_type) ? "warn" : "ok";

      const attemptsLevel = p.payment_attempts >= 5 ? "high"
                          : p.payment_attempts >= 3 ? "warn" : "ok";

      const sessionLevel  = p.session_duration < 15  ? "high"
                          : p.session_duration < 60  ? "warn" : "ok";

      const coresLevel    = p.hardware_concurrency !== null && p.hardware_concurrency <= 1 ? "warn" : "ok";

      const tzOff         = p.timezone_offset !== undefined ? p.timezone_offset : 0;
      const tzLevel       = (tzOff > 330 || tzOff < -150) ? "warn" : "ok";

      const expiryLevel   = (p.card_expired === true || p.card_expired === "true") ? "high" : "ok";

      const hourVal       = p.hour !== undefined ? p.hour : null;
      const hourLevel     = hourVal !== null && (hourVal >= 0 && hourVal < 5) ? "warn" : "ok";

      const browserVal    = (p.browser_name || "—") + (p.browser_version ? " " + p.browser_version : "");
      const browserLevel  = (p.user_agent || "").toLowerCase().match(/headless|selenium|puppeteer|bot|curl|python/) ? "high" : "ok";

      const emailDomain = (p.username && p.username.includes("@")) ? p.username.split("@")[1].toLowerCase() : "—";
      const disposableDomains = ["mailinator.com","guerrillamail.com","tempmail.com","throwam.com","yopmail.com","sharklasers.com","10minutemail.com","trashmail.com","fakeinbox.com","dispostable.com","maildrop.cc","spamgourmet.com","getairmail.com","mailnull.com","spamhere.net","spam4.me","mailnesia.com","discard.email"];
      const emailDomainLevel = emailDomain === "—" ? "warn" : disposableDomains.includes(emailDomain) ? "high" : "ok";
      const emailReason = emailDomainLevel === "high" ? "Disposable/temporary email domain — strong fraud indicator"
                        : emailDomainLevel === "warn" ? "No email provided — cannot verify domain"
                        : "Email domain appears legitimate";

      const features = [
        {
          icon: "💳", label: "Card Type & Pattern",
          value: (p.card_type || "—") + (p.card_last4 ? "  ···" + p.card_last4 : ""),
          v: verdict(cardTypeLevel),
          reason: cardTypeLevel === "warn" ? "Virtual/prepaid/gift cards carry higher fraud risk" : "Card type is standard"
        },
        {
          icon: "📅", label: "Card Expiry Date",
          value: (p.card_expiry || "—") + (p.card_expired ? " (EXPIRED)" : ""),
          v: verdict(expiryLevel),
          reason: expiryLevel === "high" ? "Card is expired or has invalid format — strong fraud indicator" : "Card is within validity period"
        },
        {
          icon: "🔐", label: "CVV Quality",
          value: cvvDigits.length > 0 ? "*".repeat(cvvDigits.length) + " (" + cvvDigits.length + " digits)" : "—",
          v: verdict(cvvLevel),
          reason: cvvLevel === "warn" ? (cvvDigits.length < 3 ? "CVV too short — missing or incomplete" : "CVV uses repeated digits — suspicious pattern") : "CVV format is valid"
        },
        {
          icon: "🕐", label: "Transaction Hour",
          value: hourVal !== null ? hourVal + "h (" + (hourVal >= 0 && hourVal < 5 ? "night" : hourVal < 12 ? "morning" : hourVal < 18 ? "afternoon" : "evening") + ")" : "—",
          v: verdict(hourLevel),
          reason: hourLevel === "warn" ? "Transaction at 0–5h — unusual night activity" : "Transaction at normal business hours"
        },
        {
          icon: "🌐", label: "Browser Fingerprint",
          value: browserVal,
          v: verdict(browserLevel),
          reason: browserLevel === "high" ? "Automation/headless browser detected — likely bot" : "Browser appears to be a real user agent"
        },
        {
          icon: "📊", label: "Payment Velocity",
          value: (p.payment_attempts !== undefined ? p.payment_attempts : "—") + " attempt(s) this session",
          v: verdict(attemptsLevel),
          reason: attemptsLevel === "high" ? "5+ payment attempts — carding pattern detected"
                : attemptsLevel === "warn" ? "3–4 payment attempts — elevated velocity"
                : "Normal number of payment attempts"
        },
        {
          icon: "⏱️", label: "Session Duration",
          value: p.session_duration !== undefined ? p.session_duration + "s" : "—",
          v: verdict(sessionLevel),
          reason: sessionLevel === "high" ? "Session under 15s — bot-like speed"
                : sessionLevel === "warn" ? "Session under 60s — unusually fast"
                : "Session duration is normal"
        },
        {
          icon: "🖥️", label: "Device Profile",
          value: (p.os_name || "—") + " · " + (p.screen_res || "—") + " · " + (p.hardware_concurrency !== undefined ? p.hardware_concurrency + " cores" : "—"),
          v: verdict(coresLevel),
          reason: coresLevel === "warn" ? "1 CPU core detected — typical of virtual/bot environment" : "Device profile looks like a real machine"
        },
        {
          icon: "🌍", label: "Timezone & Language",
          value: (p.timezone_name || "—") + " (UTC" + (tzOff <= 0 ? "+" + Math.abs(tzOff/60) : "-" + tzOff/60) + ") · " + (p.language || "—"),
          v: verdict(tzLevel),
          reason: tzLevel === "warn" ? "Timezone offset is unusual for this region" : "Timezone is consistent with expected region"
        },
        {
          icon: "📧", label: "Email Domain Risk",
          value: emailDomain,
          v: verdict(emailDomainLevel),
          reason: emailReason
        }
      ];

      const alwaysShow = ["📅 Card Expiry Date", "💳 Card Type & Pattern"];
      const influenced = features.filter(f => f.v.label !== "Normal" || alwaysShow.includes(f.label));
      const display = influenced.length > 0 ? influenced : features;
      const rowsHtml = display.map((f, i) => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px;${i % 2 === 0 ? "background:#0d0d0d;" : "background:#111;"}border-bottom:1px solid #1a1a1a;border-radius:${i === 0 ? "10px 10px 0 0" : i === display.length-1 ? "0 0 10px 10px" : "0"};">
          <span style="font-size:18px;flex-shrink:0;margin-top:1px;">${f.icon}</span>
          <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:3px;">
              <span style="font-size:12px;font-weight:600;color:#e4e4e7;">${f.label}</span>
              <span style="font-size:11px;font-weight:700;color:${f.v.color};flex-shrink:0;margin-left:8px;">${f.v.icon} ${f.v.label}</span>
            </div>
            <div style="font-size:11px;color:#caa84b;margin-bottom:2px;word-break:break-all;">${f.value}</div>
            <div style="font-size:11px;color:#52525b;line-height:1.4;">${f.reason}</div>
          </div>
        </div>`).join("");

      const raw2 = document.createElement("div");
      raw2.id = "rawFeaturesModal";
      raw2.style.cssText = "position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.85);padding:16px;";
      raw2.innerHTML = `
        <div style="background:#0b0b0b;border:1px solid #27272a;border-radius:16px;max-width:500px;width:100%;padding:24px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;max-height:90vh;overflow-y:auto;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <div style="font-size:15px;font-weight:700;color:#e4e4e7;">🔬 Why this decision?</div>
              <div style="font-size:11px;color:#52525b;margin-top:2px;">Features the fraud pipeline evaluated for this transaction</div>
            </div>
            <div style="padding:4px 10px;border-radius:6px;background:${dc}22;border:1px solid ${dc}55;font-size:12px;font-weight:700;color:${dc};">${d}</div>
          </div>
          <div style="border:1px solid #27272a;border-radius:10px;overflow:hidden;">
            ${rowsHtml}
          </div>
          <div style="text-align:right;margin-top:16px;">
            <button id="closeRawFeatures" style="padding:9px 22px;border-radius:8px;background:#27272a;color:#e4e4e7;font-weight:600;border:none;cursor:pointer;font-size:13px;">Close</button>
          </div>
        </div>`;

      document.body.appendChild(raw2);
      document.getElementById("closeRawFeatures").onclick = () => raw2.remove();
      raw2.onclick = (e) => { if (e.target === raw2) raw2.remove(); };
    };
  }

  // ----- Modal الدفع -----
  let paymentTarget = null;
  function openPaymentModal(book = null) {
    paymentTarget = book;
    if (!paymentModal) return;

    // FIX: ensure the modal is visible as a flex container
    paymentModal.style.display = "flex";
    paymentModal.style.position = "fixed";
    paymentModal.style.inset = "0";
    paymentModal.style.zIndex = "1000";
    paymentModal.style.alignItems = "center";
    paymentModal.style.justifyContent = "center";
    paymentModal.style.background = "rgba(0,0,0,0.7)";
    paymentModal.style.padding = "16px";
    paymentModal.classList.remove("hidden");

    const now = new Date();
    const hour = now.getHours();
    const pad = n => String(n).padStart(2, "0");
    const timeStr = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

    paymentModal.innerHTML = `
      <div class="bg-[#0b0b0b] rounded-xl max-w-lg w-full p-6 glass" style="max-height:90vh;overflow-y:auto;background:#0b0b0b;border:1px solid #27272a;border-radius:16px;padding:24px;font-family:Inter,ui-sans-serif,system-ui,sans-serif;">
        <div class="flex justify-between items-center mb-4" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
          <h3 class="text-xl font-semibold" style="font-size:17px;font-weight:700;color:#e4e4e7;">Secure Payment ${bookTitleFor(paymentTarget)}</h3>
          <button id="closePaymentModal" class="text-zinc-400" style="background:none;border:none;color:#a1a1aa;font-size:18px;cursor:pointer;padding:4px;">✕</button>
        </div>

        <div style="background:#111;border:1px solid #27272a;border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:11px;color:#71717a;">
          🤖 <strong style="color:#caa84b;">Fraud detection signals collected automatically:</strong><br>
          <span style="color:#52525b;">🕐 Date/Time: ${timeStr} &nbsp;|&nbsp; 🌐 Browser: auto-detected &nbsp;|&nbsp; 📊 Session: tracked &nbsp;|&nbsp; 📍 Timezone: auto</span>
        </div>

        <div style="font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Cardholder Information</div>
        <input id="payFullName" type="text" placeholder="Full name" style="width:100%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #3f3f46;background:#121212;color:white;box-sizing:border-box;">
        <input id="payEmail" type="email" placeholder="Email address" style="width:100%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #3f3f46;background:#121212;color:white;box-sizing:border-box;">

        <div style="font-size:11px;color:#a1a1aa;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;margin-top:8px;">Card Details</div>
        <select id="payCardType" style="width:100%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #3f3f46;background:#121212;color:white;box-sizing:border-box;">
          <option value="">-- Card Type --</option>
          <option value="visa">💳 Visa</option>
          <option value="mastercard">💳 Mastercard</option>
          <option value="amex">💳 American Express</option>
          <option value="discover">💳 Discover</option>
          <option value="unionpay">💳 UnionPay</option>
          <option value="jcb">💳 JCB</option>
          <option value="diners">💳 Diners Club</option>
          <option value="maestro">💳 Maestro</option>
          <option value="prepaid">💳 Prepaid Card</option>
          <option value="virtual">💳 Virtual Card</option>
          <option value="unknown">💳 Other</option>
        </select>
        <input id="payCard" type="text" placeholder="Card number (ex: 4242 4242 4242 4242)" style="width:100%;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #3f3f46;background:#121212;color:white;box-sizing:border-box;">
        <div style="display:flex;gap:8px;">
          <input id="payExp" type="text" placeholder="MM/YY" style="flex:1;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #3f3f46;background:#121212;color:white;box-sizing:border-box;">
          <input id="payCvc" type="text" placeholder="CVC" style="flex:1;padding:8px;margin-bottom:8px;border-radius:6px;border:1px solid #3f3f46;background:#121212;color:white;box-sizing:border-box;">
        </div>

        <div style="margin-top:16px;display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;">
          <button id="detailsBtn" style="padding:8px 16px;border-radius:6px;border:1px solid #3f3f46;background:none;color:#e4e4e7;cursor:pointer;font-size:13px;">Details</button>
          <button id="confirmPaymentBtn" style="padding:8px 20px;border-radius:6px;background:#caa84b;color:#000;font-weight:700;border:none;cursor:pointer;font-size:13px;">Confirm Payment</button>
          <button id="cancelPaymentBtn" style="padding:8px 16px;border-radius:6px;border:1px solid #3f3f46;background:none;color:#e4e4e7;cursor:pointer;font-size:13px;">Cancel</button>
        </div>

        <div id="detailsPanel" style="display:none;margin-top:12px;background:#0d0d0d;border:1px solid #27272a;border-radius:8px;padding:12px;font-size:11px;">
          <div style="color:#caa84b;font-weight:600;margin-bottom:8px;">🔍 Signals used by fraud detection system:</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;color:#71717a;">
            <span>💳 Card type & pattern</span>
            <span>📅 Card expiry date</span>
            <span>🔐 CVV quality</span>
            <span>🕐 Transaction hour</span>
            <span>🌐 Browser fingerprint</span>
            <span>📊 Payment velocity</span>
            <span>⏱️ Session duration</span>
            <span>🖥️ Device profile</span>
            <span>🌍 Timezone & language</span>
            <span>📧 Email domain risk</span>
          </div>
          <div style="margin-top:10px;color:#52525b;font-size:10px;">
            These signals are automatically collected and fed into FT-Transformer → AutoInt → XGBoost pipeline to produce the fraud decision.
          </div>
        </div>
      </div>`;

    document.getElementById("closePaymentModal").onclick = () => { paymentModal.style.display = "none"; };
    document.getElementById("cancelPaymentBtn").onclick  = () => { paymentModal.style.display = "none"; };
    document.getElementById("detailsBtn").onclick = () => {
      const panel = document.getElementById("detailsPanel");
      const btn   = document.getElementById("detailsBtn");
      if (panel.style.display === "none") { panel.style.display = "block"; btn.textContent = "Hide Details"; }
      else { panel.style.display = "none"; btn.textContent = "Details"; }
    };

    document.getElementById("confirmPaymentBtn").onclick = () => {
      const name     = document.getElementById("payFullName").value.trim();
      const email    = document.getElementById("payEmail").value.trim();
      const card     = document.getElementById("payCard").value.trim();
      const exp      = document.getElementById("payExp").value.trim();
      const cvc      = document.getElementById("payCvc").value.trim();
      const cardType = document.getElementById("payCardType").value;

      if (!name || !email || !cardType || !card || !exp || !cvc) {
        showToast("Please fill in all payment fields.", "info");
        return;
      }

      const cardClean = card.replace(/\s+/g, "");

      const sessionKey = "fadila_tx_count";
      const txCount = parseInt(localStorage.getItem(sessionKey) || "0") + 1;
      localStorage.setItem(sessionKey, String(txCount));

      const nav = window.navigator || {};
      const scr = window.screen   || {};
      const now2 = new Date();

      // FIX: session start — only reset if more than 30 min old (not unbounded)
      const existingStart = parseInt(localStorage.getItem("fadila_session_start") || "0");
      const sessionStart = (existingStart && (Date.now() - existingStart) < 1800000)
        ? existingStart
        : Date.now();
      localStorage.setItem("fadila_session_start", String(sessionStart));
      const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);

      const pageVisits = parseInt(localStorage.getItem("fadila_page_visits") || "1");
      localStorage.setItem("fadila_page_visits", String(pageVisits + 1));

      // login_count: incremented by your login page via localStorage.setItem("fadila_login_count", ...)
      // If no login page, we use page load count as a proxy (already tracked as page_visits)
      const loginCount = parseInt(localStorage.getItem("fadila_login_count") || "0");

      const screenWidth  = scr.width  || null;
      const screenHeight = scr.height || null;
      const colorDepth   = scr.colorDepth || null;
      const devicePixelRatio = window.devicePixelRatio || null;
      const hardwareConcurrency = nav.hardwareConcurrency || null;
      const deviceMemory = nav.deviceMemory !== undefined ? nav.deviceMemory : null;
      const platform     = nav.platform || null;
      const language     = nav.language || null;
      const userAgent    = nav.userAgent || null;
      const touchSupport = ('ontouchstart' in window) || (nav.maxTouchPoints > 0);
      const online       = nav.onLine !== undefined ? nav.onLine : true;
      const networkType  = (nav.connection && nav.connection.effectiveType) || null;

      const tzOffset = now2.getTimezoneOffset();
      const tzName   = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

      let browserName = "unknown";
      let browserVersion = "unknown";
      let osName = "unknown";
      if (userAgent) {
        if (userAgent.includes("Chrome") && !userAgent.includes("Edg")) { browserName = "Chrome"; browserVersion = (userAgent.match(/Chrome\/([\d.]+)/) || [])[1] || ""; }
        else if (userAgent.includes("Firefox")) { browserName = "Firefox"; browserVersion = (userAgent.match(/Firefox\/([\d.]+)/) || [])[1] || ""; }
        else if (userAgent.includes("Safari") && !userAgent.includes("Chrome")) { browserName = "Safari"; browserVersion = (userAgent.match(/Version\/([\d.]+)/) || [])[1] || ""; }
        else if (userAgent.includes("Edg")) { browserName = "Edge"; browserVersion = (userAgent.match(/Edg\/([\d.]+)/) || [])[1] || ""; }
        if (userAgent.includes("Windows")) osName = "Windows";
        else if (userAgent.includes("Mac")) osName = "MacOS";
        else if (userAgent.includes("Linux")) osName = "Linux";
        else if (userAgent.includes("Android")) osName = "Android";
        else if (userAgent.includes("iPhone") || userAgent.includes("iPad")) osName = "iOS";
      }

      const screenRes = (screenWidth && screenHeight) ? `${screenWidth}x${screenHeight}` : null;
      const referrer  = document.referrer || null;

      // FIX: compute card_expired before building payload (was inline IIFE that referenced exp from closure — now explicit)
      const expClean = exp.trim().replace(/[\s\-]/g, "");
      const expParts = expClean.split("/");
      let cardExpired = false;
      if (expParts.length === 2) {
        const expMonth = parseInt(expParts[0], 10);
        const yearRaw  = expParts[1].trim();
        const expYear  = yearRaw.length === 2 ? 2000 + parseInt(yearRaw, 10) : parseInt(yearRaw, 10);
        if (!isNaN(expMonth) && !isNaN(expYear) && expMonth >= 1 && expMonth <= 12) {
          const curYear  = now2.getFullYear();
          const curMonth = now2.getMonth() + 1;
          cardExpired = (expYear < curYear) || (expYear === curYear && expMonth < curMonth);
        }
      }

      // username: prefer connectedUser from login page, fallback to the email typed in the form
      const resolvedUsername = localStorage.getItem("connectedUser") || email;

      lastPayload = {
        card_type:            cardType,
        card_expiry:          exp,
        card_expired:         cardExpired,
        cvv:                  cvc,
        card_last4:           cardClean.slice(-4),
        amount:               paymentTarget ? paymentTarget.price : 10.0,
        book_title:           paymentTarget ? paymentTarget.title : "unknown",
        hour:                 hour,
        username:             resolvedUsername,
        login_count:          loginCount,
        payment_attempts:     txCount,
        page_visits:          pageVisits,
        session_duration:     sessionDuration,
        referrer:             referrer,
        user_agent:           userAgent,
        browser_name:         browserName,
        browser_version:      browserVersion,
        os_name:              osName,
        screen_res:           screenRes,
        screen_width:         screenWidth,
        screen_height:        screenHeight,
        color_depth:          colorDepth,
        device_pixel_ratio:   devicePixelRatio,
        hardware_concurrency: hardwareConcurrency,
        device_memory:        deviceMemory,
        platform:             platform,
        language:             language,
        timezone_offset:      tzOffset,
        timezone_name:        tzName,
        touch_support:        touchSupport,
        online:               online,
        network_type:         networkType
      };

      const btn = document.getElementById("confirmPaymentBtn");
      btn.disabled = true;
      btn.textContent = "⏳ Vérification...";

      fetch("https://diladila-fadila-fraud-api.hf.space/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lastPayload)
      })
      .then(r => {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(data => {
        paymentModal.style.display = "none";
        showFraudResult(data, cardType);
        if (data.decision === "OK") {
          if (paymentTarget) {
            const cart = getCart();
            cart.push(paymentTarget);
            saveCart(cart);
          }
        }
      })
      .catch((err) => {
        console.error("Fraud API error:", err);
        btn.disabled = false;
        btn.textContent = "Confirm Payment";
        showToast("❌ Erreur de connexion au serveur. Vérifiez que le backend est démarré.", "info");
      });
    };
  }

  function bookTitleFor(b) { return b ? " — " + b.title : ""; }

  if (demoPay) {
    demoPay.onclick = (e) => { e.preventDefault(); openPaymentModal(null); };
  }

  if (searchBtn) {
    searchBtn.onclick = () => {
      const q = prompt("Rechercher un livre (titre) :");
      if (q === null) return;
      const res = books.filter(b => b.title.toLowerCase().includes(q.toLowerCase()) || b.author.toLowerCase().includes(q.toLowerCase()));
      if (res.length === 0) { showToast("Aucun résultat trouvé", "info"); renderBooks(books); }
      else renderBooks(res);
    };
  }

  renderBooks();
});
