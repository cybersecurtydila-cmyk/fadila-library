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

  // ----- سلة المشتريات -----
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

      // contributions bars
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

      // explanations bullets
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
          <div style="font-size:11px;color:#52525b;text-align:right;">Valeur de base SHAP : ${baseVal}</div>
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

        <!-- Stats grid (5 tiles, no AUC) -->
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

        <!-- Close -->
        <div style="margin-top:20px;text-align:right;">
          <button id="closeFraudResult" style="padding:10px 26px;border-radius:8px;background:#caa84b;color:#000;font-weight:700;border:none;cursor:pointer;font-size:14px;">${d === "BLOCK" ? "Fermer" : "Valider"}</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.getElementById("closeFraudResult").onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  }

  // ----- Modal الدفع -----
  let paymentTarget = null;
  function openPaymentModal(book = null) {
    paymentTarget = book;
    if (!paymentModal) return;
    paymentModal.classList.remove("hidden");
    paymentModal.classList.add("flex");

    // Auto time from user's PC
    const now = new Date();
    const hour = now.getHours();
    const pad = n => String(n).padStart(2, "0");
    const timeStr = `${pad(now.getDate())}/${pad(now.getMonth()+1)}/${now.getFullYear()} ${pad(hour)}:${pad(now.getMinutes())}`;

    paymentModal.innerHTML = `
      <div class="bg-[#0b0b0b] rounded-xl max-w-md w-full p-6 glass">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">Paiement sécurisé ${bookTitleFor(paymentTarget)}</h3>
          <button id="closePaymentModal" class="text-zinc-400">✕</button>
        </div>
        <div class="mb-2 text-xs text-zinc-500">🕐 Date/heure : ${timeStr}</div>
        <input id="payFullName" type="text" placeholder="Nom complet" class="w-full p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
        <input id="payEmail" type="email" placeholder="E-mail" class="w-full p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
        <select id="payCardType" class="w-full p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
          <option value="">-- Type de carte --</option>
          <option value="visa">💳 Visa</option>
          <option value="mastercard">💳 Mastercard</option>
          <option value="amex">💳 American Express</option>
          <option value="discover">💳 Discover</option>
          <option value="unionpay">💳 UnionPay</option>
          <option value="jcb">💳 JCB</option>
          <option value="diners">💳 Diners Club</option>
          <option value="maestro">💳 Maestro</option>
          <option value="prepaid">💳 Carte Prépayée</option>
          <option value="virtual">💳 Carte Virtuelle</option>
          <option value="unknown">💳 Autre</option>
        </select>
        <input id="payCard" type="text" placeholder="Numéro de carte (ex: 4242 4242 4242 4242)" class="w-full p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
        <div class="flex gap-2">
          <input id="payExp" type="text" placeholder="MM/AA" class="w-1/2 p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
          <input id="payCvc" type="text" placeholder="CVC" class="w-1/2 p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
        </div>
        <div class="mt-4 flex justify-end gap-3">
          <button id="confirmPaymentBtn" class="px-4 py-2 rounded bg-[var(--gold)] text-black font-semibold">Confirmer le paiement</button>
          <button id="cancelPaymentBtn" class="px-4 py-2 rounded border border-zinc-700">Annuler</button>
        </div>
      </div>`;

    document.getElementById("closePaymentModal").onclick = () => { paymentModal.classList.add("hidden"); paymentModal.classList.remove("flex"); };
    document.getElementById("cancelPaymentBtn").onclick  = () => { paymentModal.classList.add("hidden"); paymentModal.classList.remove("flex"); };

    document.getElementById("confirmPaymentBtn").onclick = () => {
      const name     = document.getElementById("payFullName").value.trim();
      const email    = document.getElementById("payEmail").value.trim();
      const card     = document.getElementById("payCard").value.trim();
      const exp      = document.getElementById("payExp").value.trim();
      const cvc      = document.getElementById("payCvc").value.trim();
      const cardType = document.getElementById("payCardType").value;

      if (!name || !email || !cardType || !card || !exp || !cvc) {
        showToast("Veuillez remplir tous les champs du paiement.", "info");
        return;
      }

      const cardClean = card.replace(/\s+/g, "");

      // ── Auto-collect all browser/session signals ─────────────────────────
      const emailDomain = email.includes("@") ? email.split("@")[1].toLowerCase() : "unknown";
      const sessionKey = "fadila_tx_count";
      const txCount = parseInt(localStorage.getItem(sessionKey) || "0") + 1;
      localStorage.setItem(sessionKey, String(txCount));
      console.log("[Fadila] payment_attempts =", txCount);

      const nav = window.navigator || {};
      const scr = window.screen   || {};
      const now2 = new Date();

      // Session timing
      const sessionStart = parseInt(localStorage.getItem("fadila_session_start") || String(Date.now()));
      if (!localStorage.getItem("fadila_session_start")) localStorage.setItem("fadila_session_start", String(sessionStart));
      const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);

      const pageVisits = parseInt(localStorage.getItem("fadila_page_visits") || "1");
      localStorage.setItem("fadila_page_visits", String(pageVisits + 1));

      const loginCount = parseInt(localStorage.getItem("fadila_login_count") || "0");

      // Device fingerprint
      const screenWidth  = scr.width  || null;
      const screenHeight = scr.height || null;
      const colorDepth   = scr.colorDepth || null;
      const devicePixelRatio = window.devicePixelRatio || null;
      const hardwareConcurrency = nav.hardwareConcurrency || null;
      const deviceMemory = nav.deviceMemory || null;
      const platform     = nav.platform || null;
      const language     = nav.language || null;
      const userAgent    = nav.userAgent || null;
      const touchSupport = ('ontouchstart' in window) || (nav.maxTouchPoints > 0);
      const online       = nav.onLine !== undefined ? nav.onLine : true;
      const networkType  = (nav.connection && nav.connection.effectiveType) || null;

      // Timezone
      const tzOffset = now2.getTimezoneOffset();
      const tzName   = Intl.DateTimeFormat().resolvedOptions().timeZone || null;

      // Browser info from userAgent
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
      // ─────────────────────────────────────────────────────────────────────

      const btn = document.getElementById("confirmPaymentBtn");
      btn.disabled = true;
      btn.textContent = "⏳ Vérification...";

      fetch("https://fadila-api.dolacybersecuritys.workers.dev/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_type:            cardType,
          cvv:                  cvc,
          card_last4:           cardClean.slice(-4),
          amount:               paymentTarget ? paymentTarget.price : 10.0,
          book_title:           paymentTarget ? paymentTarget.title : "unknown",
          // Session signals
          payment_attempts:     txCount,
          page_visits:          pageVisits,
          session_duration:     sessionDuration,
          login_count:          loginCount,
          referrer:             referrer,
          // Device fingerprint
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
        })
      })
      .then(r => r.json())
      .then(data => {
        paymentModal.classList.add("hidden");
        paymentModal.classList.remove("flex");
        showFraudResult(data, cardType);
        if (data.decision === "OK") {
          const cart = getCart();
          if (paymentTarget) { cart.push(paymentTarget); saveCart(cart); }
        }
      })
      .catch(() => {
        btn.disabled = false;
        btn.textContent = "Confirmer le paiement";
        showToast("❌ Erreur de connexion au serveur. Vérifiez que le backend est démarré.", "info");
      });
    };
  }

  function bookTitleFor(b) { return b ? " — " + b.title : ""; }

  // ----- زر demoPay -----
  if (demoPay) {
    demoPay.onclick = (e) => { e.preventDefault(); openPaymentModal(null); };
  }

  // ----- بحث -----
  if (searchBtn) {
    searchBtn.onclick = () => {
      const q = prompt("Rechercher un livre (titre) :");
      if (q === null) return;
      const res = books.filter(b => b.title.toLowerCase().includes(q.toLowerCase()) || b.author.toLowerCase().includes(q.toLowerCase()));
      if (res.length === 0) { showToast("Aucun résultat trouvé", "info"); renderBooks(books); }
      else renderBooks(res);
    };
  }

  // ----- سلة -----
  function getCart() { return JSON.parse(localStorage.getItem("cart") || "[]"); }
  function saveCart(c) { localStorage.setItem("cart", JSON.stringify(c)); }

  // ----- Init -----
  renderBooks();
});
