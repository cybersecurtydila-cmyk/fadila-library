
const books = [
  {id:1, title:"Le Petit Prince", author:"Antoine de Saint-Exupéry", price:9.99, img:"https://images.unsplash.com/photo-1524995997946-a1c2e315a42f", lang:"FR"},
  {id:2, title:"Pride and Prejudice", author:"Jane Austen", price:12.5, img:"https://images.unsplash.com/photo-1528207776546-365bb710ee93", lang:"EN"},
  {id:3, title:"Les Misérables", author:"Victor Hugo", price:14.0, img:"https://images.unsplash.com/photo-1512820790803-83ca734da794", lang:"FR"},
  {id:4, title:"1984", author:"George Orwell", price:11.0, img:"https://images.unsplash.com/photo-1544938615-9f2b8af9a5c1", lang:"EN"},
  {id:5, title:"Dune", author:"Frank Herbert", price:15.0, img:"https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c", lang:"EN"},
  {id:6, title:"Madame Bovary", author:"Gustave Flaubert", price:10.0, img:"https://images.unsplash.com/photo-1519681393784-d120267933ba", lang:"FR"}
];

let cart = JSON.parse(localStorage.getItem("cart") || "[]");

// عناصر DOM
const grid = document.getElementById('grid');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const closeModalBtn = document.getElementById('closeModal');
const modalCancelBtn = document.getElementById('modalCancel');
const modalBuyBtn = document.getElementById('modalBuy');
const searchBtn = document.getElementById('searchBtn');

// ======== عرض الكتب ========
function render(booksToRender = books){
  grid.innerHTML = booksToRender.map(b=>`
    <article class="rounded-xl glass p-4 card-3d transform hover:scale-105 transition cursor-pointer" data-id="${b.id}">
      <div class="relative">
        <img loading="lazy" src="${b.img}" class="w-full h-52 object-cover rounded-md" alt="">
        <div class="absolute left-3 top-3 px-2 py-1 rounded bg-black/40 text-xs">${b.lang}</div>
      </div>
      <h3 class="mt-3 font-semibold">${b.title}</h3>
      <p class="text-sm text-zinc-300">${b.author}</p>
      <div class="mt-4 flex items-center justify-between">
        <div class="text-[var(--gold)] font-bold">${b.price.toFixed(2)} €</div>
        <div class="flex gap-2">
          <button class="btn-detail px-3 py-1 rounded border border-zinc-700 text-sm">Détails</button>
          <button class="btn-add px-3 py-1 rounded bg-[var(--gold)] text-black text-sm font-semibold">Ajouter</button>
          <button class="btn-pay px-3 py-1 rounded bg-green-600 text-white text-sm">Paiement</button>
        </div>
      </div>
    </article>`).join('');

  // الأحداث
  document.querySelectorAll('.btn-detail').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.target.closest('article').dataset.id;
      openModal(books.find(x=>x.id==id));
    });
  });
  document.querySelectorAll('.btn-add').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.target.closest('article').dataset.id;
      const book = books.find(x=>x.id==id);
      cart.push(book);
      localStorage.setItem("cart", JSON.stringify(cart));
      showToast("Ajouté", `${book.title} ajouté au panier`);
    });
  });
  document.querySelectorAll('.btn-pay').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.target.closest('article').dataset.id;
      const book = books.find(x=>x.id==id);
      openPayModal(book);
    });
  });
}

// ======== Modal détails ========
function openModal(book){
  modalTitle.textContent = book.title;
  modalBody.innerHTML = `
    <div class="md:flex gap-6">
      <img src="${book.img}" class="w-full md:w-48 h-48 object-cover rounded-md">
      <div>
        <p class="text-zinc-300">${book.author}</p>
        <p class="mt-4 font-semibold text-[var(--gold)]">${book.price.toFixed(2)} €</p>
        <p class="mt-3 text-sm text-zinc-400">Description courte du livre — parfait pour lecteurs exigeants.</p>
      </div>
    </div>`;
  modal.classList.remove('hidden');
}

closeModalBtn.onclick = modalCancelBtn.onclick = ()=> modal.classList.add('hidden');

// ======== Modal paiement ========
function openPayModal(book){
  modalTitle.textContent = `Paiement - ${book.title}`;
  modalBody.innerHTML = `
    <div class="md:flex gap-6">
      <img src="${book.img}" class="w-full md:w-48 h-48 object-cover rounded-md">
      <div class="flex flex-col gap-3">
        <p class="text-zinc-300">${book.author}</p>
        <p class="font-semibold text-[var(--gold)]">${book.price.toFixed(2)} €</p>
        <input type="text" id="cardInput" placeholder="Numéro de carte" class="p-2 rounded border border-zinc-700 bg-[#121212] text-white">
      </div>
    </div>`;
  modalBuyBtn.onclick = ()=>{
    const card = document.getElementById('cardInput').value;
    if(card) showToast("Paiement", `Paiement simulé de ${book.price.toFixed(2)} € pour ${book.title}`);
    modal.classList.add('hidden');
  };
  modal.classList.remove('hidden');
}

// ======== Toast ========
function showToast(title,msg){
  const t = document.createElement('div');
  t.className = "fixed right-6 top-6 z-50 bg-[#0f0f10] border-l-4 border-[var(--gold)] p-4 rounded shadow-lg";
  t.innerHTML = `<strong class="block">${title}</strong><div class="text-sm text-zinc-300">${msg}</div>`;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(),4500);
}

// ======== Recherche ========
const searchModal = document.createElement('div');
searchModal.id = 'searchModal';
searchModal.className = 'fixed inset-0 hidden z-50 items-center justify-center bg-black/60 p-6';
searchModal.innerHTML = `
  <div class="bg-[#0b0b0b] p-6 rounded-xl w-full max-w-lg">
    <div class="flex justify-between items-center mb-4">
      <input type="text" id="searchInput" placeholder="Rechercher un livre..." class="w-full p-2 rounded border border-zinc-700 bg-[#121212] text-white">
      <button id="closeSearch" class="ml-2 px-3 py-1 bg-[var(--gold)] rounded">✕</button>
    </div>
    <div id="searchResults" class="max-h-64 overflow-auto"></div>
  </div>`;
document.body.appendChild(searchModal);
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const closeSearch = document.getElementById('closeSearch');

searchBtn.addEventListener('click', ()=>{
  searchModal.classList.remove('hidden');
  searchInput.focus();
});
closeSearch.addEventListener('click', ()=> searchModal.classList.add('hidden'));
searchInput.addEventListener('input', ()=>{
  const query = searchInput.value.toLowerCase();
  const results = books.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query)
  );
  searchResults.innerHTML = results.map(b=>`
    <div class="p-2 border-b border-zinc-700 cursor-pointer hover:bg-zinc-800 rounded">
      <strong class="text-[var(--gold)]">${b.title}</strong> - <span>${b.author}</span>
    </div>`).join('') || '<p class="text-zinc-400">Aucun résultat</p>';
});

// ======== Filtrage langue ========
document.querySelectorAll('nav a[href^="#catalog"]').forEach(link=>{
  link.addEventListener('click', e=>{
    e.preventDefault();
    let lang = link.textContent.includes("FR") ? "FR" :
               link.textContent.includes("English") ? "EN" : null;
    if(lang) render(books.filter(b=>b.lang===lang));
    else render();
  });
});

// Demo pay principal
document.getElementById('demoPay').addEventListener('click', ()=> showToast("Paiement", "Mode démo — intégration Stripe ultérieure"));

// أول تحميل
render();