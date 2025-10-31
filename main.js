// Estado e usuários de exemplo
let users = {}, currentUser = null, ratingsByUser = {};
const exampleUsers = [
  { username: 'ana.santos', bio: 'Desenvolvedora web e amante de café', ratings: { Chata: 2, Legal: 15, Perfeita: 28 } },
  { username: 'carlos.dev', bio: 'Designer UI/UX apaixonado por tecnologia', ratings: { Chata: 1, Legal: 20, Perfeita: 35 } },
  { username: 'julia.arts', bio: 'Artista digital criando mundos coloridos', ratings: { Chata: 0, Legal: 12, Perfeita: 42 } },
  { username: 'pedro.tech', bio: 'Engenheiro de software e gamer nas horas vagas', ratings: { Chata: 3, Legal: 18, Perfeita: 22 } },
  { username: 'maria.music', bio: 'Produtora musical e DJ profissional', ratings: { Chata: 1, Legal: 25, Perfeita: 38 } },
  { username: 'lucas.fit', bio: 'Personal trainer ajudando pessoas a mudarem de vida', ratings: { Chata: 0, Legal: 30, Perfeita: 45 } }
];
exampleUsers.forEach(u => users[u.username] = { ...u });

// UI refs
const views = document.querySelectorAll('.view'),
  navItems = document.querySelectorAll('.nav-item'),
  searchInput = document.getElementById('searchInput'),
  userFeed = document.getElementById('userFeed'),
  displayName = document.getElementById('displayName'),
  displayUsername = document.getElementById('displayUsername'),
  bioInput = document.getElementById('bioInput'),
  charCount = document.getElementById('charCount'),
  saveBioBtn = document.getElementById('saveBio'),
  ratingsCard = document.getElementById('ratingsCard'),
  backBtn = document.getElementById('backBtn'),
  ratingResult = document.getElementById('ratingResult'),
  ratingButtonsContainer = document.getElementById('ratingButtonsContainer');

// Auth refs
const authBackdrop = document.getElementById('authBackdrop'),
  authClose = document.getElementById('authClose'),
  authTabs = document.querySelectorAll('.auth-tab'),
  authTitle = document.getElementById('authTitle'),
  authSub = document.getElementById('authSub'),
  authForm = document.getElementById('authForm'),
  authUsername = document.getElementById('authUsername'),
  authPassword = document.getElementById('authPassword'),
  authRemember = document.getElementById('authRemember'),
  authSubmit = document.getElementById('authSubmit'),
  authHint = document.getElementById('authHint'),
  toast = document.getElementById('toast');

// Toast
function toastMsg(msg, type = 'ok') {
  toast.textContent = msg;
  toast.style.background = type === 'err' ? '#e53e3e' : '#48bb78';
  toast.setAttribute('role', 'status');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Navegação de views
function switchView(id) {
  views.forEach(v => v.classList.remove('active'));
  const t = document.getElementById(id);
  t && t.classList.add('active');
  navItems.forEach(i => { i.dataset.view === id ? i.classList.add('active') : i.classList.remove('active') });
  document.querySelector('.content').scrollTop = 0;
}

// Render do feed de usuários (filtra por username e bio)
function renderUserFeed(q = '') {
  userFeed.innerHTML = '';
  Object.entries(users).forEach(([u, d]) => {
    if (q) {
      const matchUser = u.toLowerCase().includes(q.toLowerCase());
      const matchBio = (d.bio || '').toLowerCase().includes(q.toLowerCase());
      if (!matchUser && !matchBio) return;
    }
    if (currentUser && u === currentUser) return;
    const card = document.createElement('div');
    card.className = 'user-card';
    card.innerHTML = `<div class="user-card-avatar"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg></div><div class="user-card-name">@${u}</div><div class="user-card-bio"></div>`;
    card.querySelector('.user-card-bio').textContent = d.bio || 'Sem bio';
    card.onclick = () => showUserProfile(u);
    userFeed.appendChild(card);
  });
  if (userFeed.children.length === 0) userFeed.innerHTML = '<p style="text-align:center;color:#a0aec0;padding:40px;">Nenhum usuário encontrado</p>';
}

// Mostrar perfil de outro usuário (prepara botões de avaliação)
function showUserProfile(u) {
  const d = users[u]; if (!d) return;
  document.getElementById('otherDisplayName').textContent = u;
  document.getElementById('otherDisplayUsername').textContent = '@' + u;
  document.getElementById('otherBioText').textContent = d.bio || 'Nenhuma bio cadastrada ainda.';
  document.getElementById('otherRateChata').textContent = d.ratings.Chata || 0;
  document.getElementById('otherRateLegal').textContent = d.ratings.Legal || 0;
  document.getElementById('otherRatePerfeita').textContent = d.ratings.Perfeita || 0;
  ratingResult.classList.remove('show');
  ratingButtonsContainer.innerHTML = `<button class="btn-rate" data-value="Chata"><span class="rate-emoji">😐</span>Chata</button><button class="btn-rate" data-value="Legal"><span class="rate-emoji">😊</span>Legal</button><button class="btn-rate" data-value="Perfeita"><span class="rate-emoji">😍</span>Perfeita</button>`;
  const already = hasRated(currentUser, u);
  document.querySelectorAll('#ratingButtonsContainer .btn-rate').forEach(btn => {
    if (already) { btn.disabled = true; btn.style.opacity = '.6'; btn.style.cursor = 'not-allowed' }
    btn.onclick = function () {
      if (!currentUser) { openAuthModal('login'); toastMsg('Entre para avaliar', 'err'); return }
      if (hasRated(currentUser, u)) { toastMsg('Você já avaliou este perfil', 'err'); return }
      const val = this.dataset.value;
      rateUser(u, val);
      document.querySelectorAll('#ratingButtonsContainer .btn-rate').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      ratingResult.textContent = `Você avaliou como: ${val}`;
      ratingResult.classList.add('show');
      document.querySelectorAll('#ratingButtonsContainer .btn-rate').forEach(b => { b.disabled = true; b.style.opacity = '.6'; b.style.cursor = 'not-allowed' })
    }
  });
  switchView('otherProfileView');
}
function rateUser(u, val) {
  users[u].ratings || (users[u].ratings = { Chata: 0, Legal: 0, Perfeita: 0 });
  users[u].ratings[val]++;
  document.getElementById('otherRateChata').textContent = users[u].ratings.Chata;
  document.getElementById('otherRateLegal').textContent = users[u].ratings.Legal;
  document.getElementById('otherRatePerfeita').textContent = users[u].ratings.Perfeita;
  markRated(currentUser, u);
  saveStore();
}

function saveStore() {
  try {
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', currentUser || '');
    localStorage.setItem('ratingsByUser', JSON.stringify(ratingsByUser));
  } catch (e) { }
}

function loadStore() {
  try {
    const cu = localStorage.getItem('currentUser') || null,
      us = localStorage.getItem('users'),
      rb = localStorage.getItem('ratingsByUser');
    if (us) users = { ...users, ...JSON.parse(us) };
    if (rb) ratingsByUser = JSON.parse(rb) || {};
    if (cu && users[cu]) {
      currentUser = cu;
      displayName.textContent = '@' + cu;
      displayUsername.textContent = cu;
      bioInput && (bioInput.value = users[cu].bio || '');
      charCount && (charCount.textContent = (bioInput.value || '').length);
      const r = users[cu].ratings;
      if (r && r.Chata + r.Legal + r.Perfeita > 0) {
        ratingsCard.style.display = 'block';
        document.getElementById('rateChata').textContent = r.Chata;
        document.getElementById('rateLegal').textContent = r.Legal;
        document.getElementById('ratePerfeita').textContent = r.Perfeita;
      }
    }
  } catch (e) { console.log('Erro ao carregar dados:', e) }
}

function hasRated(rater, target) {
  if (!rater || !target) return false;
  const m = ratingsByUser[rater] || {};
  return !!m[target];
}

function markRated(rater, target) {
  if (!rater || !target) return;
  ratingsByUser[rater] = ratingsByUser[rater] || {};
  ratingsByUser[rater][target] = true;
}

// Busca
searchInput && searchInput.addEventListener('input', e => renderUserFeed(e.target.value));

// Navegação
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const v = item.dataset.view;
    if (v === 'profileView' && !currentUser) { openAuthModal('login'); return }
    if (v === 'homeView') renderUserFeed();
    switchView(v);
  });
});
backBtn && backBtn.addEventListener('click', () => { switchView('homeView'); renderUserFeed() });

// Bio
if (saveBioBtn && bioInput) {
  bioInput.addEventListener('input', () => {
    const n = bioInput.value.length;
    charCount.textContent = n;
    charCount.style.color = n > 180 ? '#e53e3e' : '#a0aec0';
  });
  saveBioBtn.addEventListener('click', () => {
    const v = bioInput.value.trim();
    if (currentUser && users[currentUser]) {
      users[currentUser].bio = v;
      saveStore();
      toastMsg('Bio salva com sucesso');
      const t = users[currentUser].ratings;
      if (t.Chata + t.Legal + t.Perfeita > 0) {
        ratingsCard.style.display = 'block';
        document.getElementById('rateChata').textContent = t.Chata;
        document.getElementById('rateLegal').textContent = t.Legal;
        document.getElementById('ratePerfeita').textContent = t.Perfeita;
      }
    }
  });
}

// Auth modal
function openAuthModal(mode = 'login') { authBackdrop.classList.add('show'); setAuthMode(mode); authUsername.focus(); }
function closeAuthModal() { authBackdrop.classList.remove('show'); authForm.reset(); }
function setAuthMode(mode) {
  authTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
  if (mode === 'login') {
    authTitle.textContent = 'Entrar';
    authSub.textContent = 'Bem-vindo de volta. Faça login na sua conta.';
    authSubmit.textContent = 'Entrar';
    authHint.textContent = 'Use seu usuário e senha';
  } else {
    authTitle.textContent = 'Criar conta';
    authSub.textContent = 'Escolha um nome de usuário único';
    authSubmit.textContent = 'Criar conta';
    authHint.textContent = 'Apenas letras, números, ponto e underline';
  }
}
authClose && authClose.addEventListener('click', closeAuthModal);
authBackdrop && authBackdrop.addEventListener('click', e => { if (e.target === authBackdrop) closeAuthModal() });
authTabs.forEach(t => t.addEventListener('click', () => setAuthMode(t.dataset.mode)));

// Helpers
function normUser(u) { return (u || '').trim().toLowerCase(); }
function validUser(u) { return /^[a-z0-9._]+$/.test(u); }
function hash(s) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h) + s.charCodeAt(i), h |= 0; return String(h); }

// Login/Signup submit
authForm && authForm.addEventListener('submit', e => {
  e.preventDefault();
  const isSignup = document.querySelector('.auth-tab.active').dataset.mode === 'signup';
  let u = normUser(authUsername.value), p = (authPassword.value || '').trim();
  if (!u || !p) { toastMsg('Preencha usuário e senha', 'err'); return }
  if (isSignup) {
    if (!validUser(u)) { toastMsg('Use letras, números, ponto e underline', 'err'); return }
    if (users[u]) { toastMsg('Usuário já existe', 'err'); return }
    users[u] = { username: u, bio: '', ratings: { Chata: 0, Legal: 0, Perfeita: 0 }, password: hash(p) };
    currentUser = u;
    displayName.textContent = '@' + u;
    displayUsername.textContent = u;
    saveStore(); renderUserFeed(); closeAuthModal(); toastMsg('Conta criada'); switchView('profileView');
  } else {
    if (!users[u]) { toastMsg('Usuário não encontrado', 'err'); return }
    const ok = (users[u].password || '') === hash(p);
    if (!ok) { toastMsg('Senha incorreta', 'err'); return }
    currentUser = u;
    displayName.textContent = '@' + u;
    displayUsername.textContent = u;
    saveStore(); renderUserFeed(); closeAuthModal(); toastMsg('Login realizado'); switchView('profileView');
  }
});

// Boot
window.addEventListener('DOMContentLoaded', () => { loadStore(); renderUserFeed(); });
// --- BADGES & REPUTAÇÃO ---

function getUserBadges(u) {
  const d = users[u];
  if (!d) return [];
  const total = (d.ratings.Chata || 0) + (d.ratings.Legal || 0) + (d.ratings.Perfeita || 0);
  const badges = [];

  if (total >= 30) badges.push({ icon: "🔥", text: "Popular" });
  if ((d.ratings.Perfeita || 0) >= 20) badges.push({ icon: "😍", text: "Muito Amada" });
  if ((d.ratings.Legal || 0) >= 20) badges.push({ icon: "😊", text: "Gente Boa" });
  if ((d.ratings.Chata || 0) === 0 && total >= 10) badges.push({ icon: "🛡️", text: "Sempre Legal" });
  if (total >= 1 && total < 10) badges.push({ icon: "🌱", text: "Começando Agora" });

  return badges;
}

function getUserReputation(u) {
  const d = users[u];
  if (!d) return { nivel: "Iniciante", icon: "⭐", className: "" };
  const total = (d.ratings.Chata || 0) + (d.ratings.Legal || 0) + (d.ratings.Perfeita || 0);
  if (total >= 50) return { nivel: "Ouro", icon: "🥇", className: "" };
  if (total >= 30) return { nivel: "Prata", icon: "🥈", className: "badge-silver" };
  if (total >= 10) return { nivel: "Bronze", icon: "🥉", className: "badge-bronze" };
  return { nivel: "Iniciante", icon: "⭐", className: "" };
}

function renderBadgesAndReputation(u, badgesId, repId) {
  // Badges
  const badges = getUserBadges(u);
  const badgesDiv = document.getElementById(badgesId);
  if (badgesDiv) {
    badgesDiv.innerHTML = "";
    badges.forEach(b =>
      badgesDiv.innerHTML += `<span class="badge">${b.icon} ${b.text}</span>`
    );
    if (!badges.length) badgesDiv.style.display = "none";
    else badgesDiv.style.display = "flex";
  }
  // Reputação
  const rep = getUserReputation(u);
  const repDiv = document.getElementById(repId);
  if (repDiv) {
    repDiv.innerHTML = `<span class="rep-icon">${rep.icon}</span><span>${rep.nivel}</span>`;
    if (rep.className) repDiv.classList.add(rep.className); else repDiv.className = "profile-reputation";
    repDiv.style.display = "flex";
  }
}

// Chamar nos lugares certos:

// Próprio perfil
function renderOwnProfileBadgesAndReputation() {
  if (currentUser) renderBadgesAndReputation(currentUser, "profileBadges", "profileReputation");
}

// Outro perfil
function renderOtherProfileBadgesAndReputation(u) {
  renderBadgesAndReputation(u, "otherProfileBadges", "otherProfileReputation");
}

// Integração: após login, cadastro, salvar bio, avaliar alguém, etc.
const oldLoadStore = loadStore;
loadStore = function() {
  oldLoadStore.apply(this, arguments);
  renderOwnProfileBadgesAndReputation();
};
const oldRenderUserFeed = renderUserFeed;
renderUserFeed = function(q) {
  oldRenderUserFeed.apply(this, arguments);
  renderOwnProfileBadgesAndReputation();
};
const oldShowUserProfile = showUserProfile;
showUserProfile = function(u) {
  oldShowUserProfile.apply(this, arguments);
  renderOtherProfileBadgesAndReputation(u);
};
const oldRateUser = rateUser;
rateUser = function(u, val) {
  oldRateUser.apply(this, arguments);
  renderOtherProfileBadgesAndReputation(u);
  renderOwnProfileBadgesAndReputation();
};
if (saveBioBtn) {
  const oldSaveBio = saveBioBtn.onclick;
  saveBioBtn.onclick = function() {
    if (oldSaveBio) oldSaveBio.apply(this, arguments);
    renderOwnProfileBadgesAndReputation();
  };
}
