const panierItems = document.getElementById("panierItems");
const panier = JSON.parse(localStorage.getItem("panier") || "[]");

if (panier.length === 0) {
  panierItems.innerHTML = "<p class='text-zinc-400'>Votre panier est vide.</p>";
} else {
  panier.forEach(item => {
    const div = document.createElement("div");
    div.className = "border border-zinc-800 p-4 rounded-xl flex justify-between items-center";
    div.innerHTML = `
      <div>
        <h3 class="font-semibold">${item.titre}</h3>
        <p class="text-zinc-400">${item.auteur}</p>
      </div>
      <span class="text-[var(--gold)] font-bold">${item.prix}€</span>
    `;
    panierItems.appendChild(div);
  });
}