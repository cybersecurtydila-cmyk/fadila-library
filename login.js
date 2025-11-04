const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const msg = document.getElementById("msg");

registerTab.onclick = () => {
  loginForm.classList.add("hidden");
  registerForm.classList.remove("hidden");
  registerTab.classList.add("border-[var(--gold)]");
  loginTab.classList.remove("border-[var(--gold)]");
};
loginTab.onclick = () => {
  registerForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  loginTab.classList.add("border-[var(--gold)]");
  registerTab.classList.remove("border-[var(--gold)]");
};

registerForm.onsubmit = (e) => {
  e.preventDefault();
  const user = regUser.value;
  const email = regEmail.value;
  const pass = regPass.value;
  if (!user || !email || !pass) return msg.textContent = "Remplissez tous les champs.";
  localStorage.setItem("user_" + user, JSON.stringify({ email, pass }));
  msg.textContent = "Compte créé avec succès ! Vous pouvez vous connecter.";
  regUser.value = regEmail.value = regPass.value = "";
};

loginForm.onsubmit = (e) => {
  e.preventDefault();
  const user = loginUser.value;
  const pass = loginPass.value;
  const stored = localStorage.getItem("user_" + user);
  if (!stored) return msg.textContent = "Utilisateur introuvable.";
  const data = JSON.parse(stored);
  if (data.pass === pass) {
    msg.textContent = "Connexion réussie !";
    localStorage.setItem("connectedUser", user);
    setTimeout(() => location.href = "index.html", 1000);
  } else msg.textContent = "Mot de passe incorrect.";
};