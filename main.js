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

  // ----- ربط الأحداث (delegation بسيطة) -----
  function attachBookListeners() {
    grid.querySelectorAll(".btn-detail").forEach(btn => {
      btn.onclick = (e) => {
        const art = e.target.closest("article");
        const id = Number(art.dataset.id);
        const book = books.find(b => b.id === id);
        openDetailModal(book);
      };
    });
    grid.querySelectorAll(".btn-add").forEach(btn => {
      btn.onclick = (e) => {
        const art = e.target.closest("article");
        const id = Number(art.dataset.id);
        const book = books.find(b => b.id === id);
        addToCart(book);
      };
    });
    grid.querySelectorAll(".btn-pay").forEach(btn => {
      btn.onclick = (e) => {
        const art = e.target.closest("article");
        const id = Number(art.dataset.id);
        const book = books.find(b => b.id === id);
        openPaymentModal(book);
      };
    });
  }

  // ----- سلة المشتريات (localStorage) -----
  function getCart() {
    try { return JSON.parse(localStorage.getItem("cart") || "[]"); }
    catch { return []; }
  }
  function saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
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
      </div>
    `;
    modal.classList.remove("hidden");

    const detailBuy = document.getElementById("detailBuy");
    if (detailBuy) {
      detailBuy.onclick = () => {
        modal.classList.add("hidden");
        openPaymentModal(book);
      };
    }
  }

  if (closeModal) closeModal.onclick = () => modal.classList.add("hidden");
  if (modalCancel) modalCancel.onclick = () => modal.classList.add("hidden");

  // ----- Modal الدفع (نموذج أكثر تفصيلاً) -----
  let paymentTarget = null;
  function openPaymentModal(book = null) {
    paymentTarget = book;
    if (!paymentModal) return;
    paymentModal.classList.remove("hidden");
    paymentModal.classList.add("flex");

    paymentModal.innerHTML = `
      <div class="bg-[#0b0b0b] rounded-xl max-w-md w-full p-6 glass">
        <div class="flex justify-between items-center mb-4">
          <h3 id="paymentModalTitle" class="text-xl font-semibold">Paiement sécurisé ${bookTitleFor(paymentTarget)}</h3>
          <button id="closePaymentModal" class="text-zinc-400">✕</button>
        </div>
        <input id="payFullName" type="text" placeholder="Nom complet" class="w-full p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
        <input id="payEmail" type="email" placeholder="E-mail" class="w-full p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
        <input id="payCard" type="text" placeholder="Numéro de carte (ex: 4242 4242 4242 4242)" class="w-full p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
        <div class="flex gap-2">
          <input id="payExp" type="text" placeholder="MM/AA" class="w-1/2 p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
          <input id="payCvc" type="text" placeholder="CVC" class="w-1/2 p-2 mb-2 rounded border border-zinc-700 bg-[#121212] text-white">
        </div>
        <div class="mt-4 flex justify-end gap-3">
          <button id="confirmPaymentBtn" class="px-4 py-2 rounded bg-[var(--gold)] text-black font-semibold">Confirmer le paiement</button>
          <button id="cancelPaymentBtn" class="px-4 py-2 rounded border border-zinc-700">Annuler</button>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById("closePaymentModal");
    const cancelBtn = document.getElementById("cancelPaymentBtn");
    const confirmBtn = document.getElementById("confirmPaymentBtn");

    if (closeBtn) closeBtn.onclick = () => { paymentModal.classList.add("hidden"); };
    if (cancelBtn) cancelBtn.onclick = () => { paymentModal.classList.add("hidden"); };

    if (confirmBtn) confirmBtn.onclick = () => {
      const name = document.getElementById("payFullName").value.trim();
      const email = document.getElementById("payEmail").value.trim();
      const card = document.getElementById("payCard").value.trim();
      const exp = document.getElementById("payExp").value.trim();
      const cvc = document.getElementById("payCvc").value.trim();

      if (!name || !email || !card || !exp || !cvc) {
        showToast("Veuillez remplir tous les champs du paiement.", "info");
        return;
      }

      // ── Fraud detection API call ──────────────────────────────────────────
      const cardClean = card.replace(/\s+/g, "");
      const cardType = cardClean.startsWith("4") ? "visa" :
                       cardClean.startsWith("5") ? "mastercard" :
                       cardClean.startsWith("3") ? "amex" : "unknown";

      showToast("⏳ Vérification en cours...", "info");

      fetch("https://suppliers-payment-midi-comp.trycloudflare.com/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          card_type:  cardType,
          cvv:        cvc,
          card_last4: cardClean.slice(-4),
          amount:     paymentTarget ? paymentTarget.price : 10.0,
          book_title: paymentTarget ? paymentTarget.title : "unknown"
        })
      })
      .then(r => r.json())
      .then(data => {
        paymentModal.classList.add("hidden");
        if (data.decision === "OK") {
          showToast(`✅ Paiement approuvé — ${paymentTarget ? paymentTarget.title : "commande"}`, "success");
          const cart = getCart();
          if (paymentTarget) { cart.push(paymentTarget); saveCart(cart); }
        } else if (data.decision === "SUSPICIOUS") {
          showToast("⚠️ Activité suspecte détectée. Vérifiez vos informations.", "info");
        } else {
          showToast("🚫 Transaction bloquée — risque de fraude détecté.", "info");
        }
      })
      .catch(() => {
        paymentModal.classList.add("hidden");
        showToast("❌ Erreur de connexion au serveur.", "info");
      });
      // ─────────────────────────────────────────────────────────────────────
    };
  }

  function bookTitleFor(b){ return b ? " — " + b.title : ""; }

  // ----- زر demoPay في الهيرو -----
  if (demoPay) {
    demoPay.onclick = (e) => {
      e.preventDefault();
      openPaymentModal(null);
    };
  }

  // ----- بحث بسيط عند الضغط على searchBtn -----
  if (searchBtn) {
    searchBtn.onclick = () => {
      const q = prompt("Rechercher un livre (titre) :");
      if (q === null) return;
      const res = books.filter(b => b.title.toLowerCase().includes(q.toLowerCase()) || b.author.toLowerCase().includes(q.toLowerCase()));
      if (res.length === 0) {
        showToast("Aucun résultat trouvé", "info");
        renderBooks(books);
      } else {
        renderBooks(res);
      }
    };
  }

  // ----- مساعدة: جلب واستخدام السلة -----
  function getCart(){ return JSON.parse(localStorage.getItem("cart") || "[]"); }
  function saveCart(c){ localStorage.setItem("cart", JSON.stringify(c)); }

  // ----- تهيئة أولية -----
  renderBooks();

  // ----- نهاية DOMContentLoaded -----
});
