
// --- Données des livres (قائمة الكتب) ---
const books = [
  {id:1, title:"Le Petit Prince", author:"Antoine de Saint-Exupéry", price:9.99, img:"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f", lang:"FR"},
  {id:2, title:"Pride and Prejudice", author:"Jane Austen", price:12.5, img:"https://images.unsplash.com/photo-1528207776546-365bb710ee93", lang:"EN"},
  {id:3, title:"Les Misérables", author:"Victor Hugo", price:14.0, img:"https://images.unsplash.com/photo-1512820790803-83ca734da794", lang:"FR"},
  {id:4, title:"1984", author:"George Orwell", price:11.0, img:"https://images.unsplash.com/photo-1544938615-9f2b8af9a5c1", lang:"EN"},
  {id:5, title:"Dune", author:"Frank Herbert", price:15.0, img:"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c", lang:"EN"},
  {id:6, title:"Madame Bovary", author:"Gustave Flaubert", price:10.0, img:"https://images.unsplash.com/photo-1519681393784-d120267933ba", lang:"FR"}
];

const grid = document.getElementById('grid');

// --- Affichage des livres ---
function render() {
  grid.innerHTML = books.map(b => `
    <article class="rounded-xl glass p-4 card-3d transform hover:scale-105 transition cursor-pointer" data-id="${b.id}">
      <div class="relative">
        <img src="${b.img}" class="w-full h-52 object-cover rounded-md" alt="">
        <div class="absolute left-3 top-3 px-2 py-1 rounded bg-black/40 text-xs">${b.lang}</div>
      </div>
      <h3 class="mt-3 font-semibold">${b.title}</h3>
      <p class="text-sm text-zinc-300">${b.author}</p>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-[var(--gold)] font-bold">${b.price.toFixed(2)} €</div>
        <div class="flex gap-2">
          <button class="btn-add px-3 py-1 rounded bg-[var(--gold)] text-black text-sm font-semibold">Ajouter</button>
          <button class="btn-pay px-3 py-1 rounded border border-zinc-700 text-sm hover:bg-zinc-800">Payer</button>
        </div>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.btn-add').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.closest('article').dataset.id;
      const book = books.find(x => x.id == id);
      addToCart(book);
    });
  });

  document.querySelectorAll('.btn-pay').forEach(btn => {
    btn.addEventListener('click', e => {
      const id = e.target.closest('article').dataset.id;
      const book = books.find(x => x.id == id);
      openPaymentModal(book);
    });
  });
}

render();

// --- Panier (السلة) ---
let panier = JSON.parse(localStorage.getItem('panier')) || [];

function addToCart(book) {
  panier.push(book);
  localStorage.setItem('panier', JSON.stringify(panier));
  showToast("Ajouté", `${book.title} a été ajouté au panier.`);
}

// --- Paiement (الدفع) ---
function openPaymentModal(book) {
  const modal = document.createElement('div');
  modal.className = "fixed inset-0 bg-black/70 flex items-center justify-center z-50";
  
  const total = book.price.toFixed(2);
  modal.innerHTML = `
    <div class="bg-[#0b0b0b] rounded-xl p-6 w-80 text-center border border-zinc-700">
      <h3 class="text-xl font-semibold mb-2 text-[var(--gold)]">Paiement sécurisé</h3>
      <p class="text-zinc-300 mb-2">${book.title}</p>
      <p class="font-bold text-[var(--gold)] mb-4">${total} €</p>
      <input type="text" id="cardNumber" maxlength="16" placeholder="Numéro de carte (16 chiffres)" class="w-full p-2 rounded bg-zinc-900 text-white border border-zinc-700 text-center">
      <button id="payConfirm" class="mt-4 px-6 py-2 rounded bg-[var(--gold)] text-black font-semibold w-full">Valider le paiement</button>
      <button id="closeModal" class="mt-3 px-4 py-2 rounded border border-zinc-700 text-sm w-full">Annuler</button>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('closeModal').onclick = () => modal.remove();
  document.getElementById('payConfirm').onclick = () => {
    const card = document.getElementById('cardNumber').value.trim();
    if (card.length === 16 && /^\d+$/.test(card)) {
      modal.remove();
      showToast("Paiement réussi ✅", `Merci pour votre achat de "${book.title}" (${total} €).`);
    } else {
      alert("❌ Numéro de carte invalide !");
    }
  };
}

// --- Toast (الإشعارات الجميلة) ---
function showToast(title, msg) {
  const t = document.createElement('div');
  t.className = "fixed right-6 top-6 z-50 bg-[#0f0f10] border-l-4 border-[var(--gold)] p-4 rounded shadow-lg";
  t.innerHTML = `<strong class="block">${title}</strong><div class="text-sm text-zinc-300">${msg}</div>`;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 4000);
}