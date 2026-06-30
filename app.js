(() => {
  const DATA = window.LUNCH_JACKPOT_DATA;
  const $ = (id) => document.getElementById(id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const STORAGE_KEY = "lunchJackpotV3";

  let state = {
    total: 0,
    categories: {},
    dishes: {},
    history: [],
    favorites: []
  };
  let current = null;
  let musicOn = false;

  try {
    state = { ...state, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
  } catch {}

  const els = {
    spin: $("spinButton"),
    music: $("musicToggle"),
    reset: $("resetStats"),
    bgMusic: $("bgMusic"),
    strips: {
      category: $("stripCategory"),
      dish: $("stripDish"),
      challenge: $("stripChallenge")
    },
    reels: [$("reelCategory"), $("reelDish"), $("reelChallenge")],
    resultDish: $("resultDish"),
    resultCategory: $("resultCategory"),
    resultBudget: $("resultBudget"),
    resultChallenge: $("resultChallenge"),
    resultFortune: $("resultFortune"),
    rarity: $("rarityBadge"),
    favorite: $("favoriteButton"),
    nearby: $("nearbyButton"),
    share: $("shareButton"),
    total: $("totalSpins"),
    topCategory: $("topCategory"),
    topDish: $("topDish"),
    history: $("historyList"),
    favorites: $("favoritesList"),
    toast: $("toast"),
    musicNotice: $("musicNotice")
  };

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("toast--show");
    setTimeout(() => els.toast.classList.remove("toast--show"), 1300);
  }

  function topName(obj) {
    let best = "-";
    let bestVal = 0;
    Object.entries(obj || {}).forEach(([key, val]) => {
      if (val > bestVal) {
        best = key;
        bestVal = val;
      }
    });
    return best;
  }

  function updateDashboard() {
    els.total.textContent = state.total || 0;
    els.topCategory.textContent = topName(state.categories);
    els.topDish.textContent = topName(state.dishes);

    els.history.innerHTML = state.history.length
      ? state.history.map((item) => `<li>${item.dish} <small>(${item.category})</small></li>`).join("")
      : "<li>No spins yet.</li>";

    els.favorites.innerHTML = state.favorites.length
      ? state.favorites.map((dish) => `<span>${dish}</span>`).join("")
      : "<span>No favorites yet.</span>";
  }

  function slotHTML(emoji, text) {
    return `<div class="slot"><div><strong>${emoji}</strong><span>${text}</span></div></div>`;
  }

  function fillStrip(strip, items) {
    strip.classList.remove("reel__strip--final");
    strip.innerHTML = items.map((item) => slotHTML(item.emoji, item.text)).join("");
  }

  function showFinalReels(result) {
    fillStrip(els.strips.category, [{ emoji: result.category.emoji, text: result.category.name }]);
    fillStrip(els.strips.dish, [{ emoji: result.category.emoji, text: result.dish }]);
    fillStrip(els.strips.challenge, [{ emoji: "🎯", text: result.challenge }]);

    Object.values(els.strips).forEach((strip) => {
      strip.classList.add("reel__strip--final");
    });
  }

  function allDishes() {
    return DATA.categories.flatMap((category) => category.items);
  }

  function randomItemFor(type, finalItem) {
    const items = [];
    for (let i = 0; i < 9; i++) {
      if (type === "category") {
        const c = pick(DATA.categories);
        items.push({ emoji: c.emoji, text: c.name });
      }
      if (type === "dish") {
        const c = pick(DATA.categories);
        items.push({ emoji: c.emoji, text: pick(c.items) });
      }
      if (type === "challenge") {
        items.push({
          emoji: pick(["🎯", "👥", "🌶️", "💰", "📸", "⭐", "🎲"]),
          text: pick(DATA.challenges)
        });
      }
    }
    items.push(finalItem);
    return items;
  }

  function chooseCategory() {
    const roll = Math.random();
    const special = DATA.categories.filter((c) => ["Epic", "Legendary"].includes(c.rarity));
    if (roll > 0.84 && special.length) return pick(special);
    return pick(DATA.categories);
  }

  function chooseResult() {
    const category = chooseCategory();
    return {
      category,
      dish: pick(category.items),
      challenge: pick(DATA.challenges),
      fortune: pick(DATA.fortunes)
    };
  }

  function record(result) {
    state.total += 1;
    state.categories[result.category.name] = (state.categories[result.category.name] || 0) + 1;
    state.dishes[result.dish] = (state.dishes[result.dish] || 0) + 1;
    state.history.unshift({
      dish: result.dish,
      category: result.category.name,
      at: new Date().toISOString()
    });
    state.history = state.history.slice(0, 10);
    save();
    updateDashboard();
  }

  function confetti(count = 70) {
    const colors = ["#FFD166", "#EF476F", "#06D6A0", "#118AB2", "#C77DFF", "#FF5A1F"];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement("div");
      piece.className = "confetti";
      piece.style.left = Math.random() * 100 + "vw";
      piece.style.background = pick(colors);
      piece.style.animationDelay = Math.random() * 0.35 + "s";
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2200);
    }
  }

  function applyResult(result) {
    current = result;
    els.resultDish.textContent = result.dish;
    els.resultCategory.textContent = `${result.category.emoji} ${result.category.name}`;
    els.resultBudget.textContent = `💰 ${result.category.budget}`;
    els.resultChallenge.textContent = `🎯 ${result.challenge}`;
    els.resultFortune.textContent = result.fortune;

    const rarity = result.category.rarity;
    els.rarity.textContent = rarity.toUpperCase();
    els.rarity.className = `rarity rarity--${rarity.toLowerCase()}`;

    record(result);

    if (["Epic", "Legendary"].includes(rarity)) {
      confetti(90);
    }
  }

  function setMusicUI(isOn, message, blocked = false) {
    musicOn = isOn;
    els.music.textContent = isOn ? "🔇" : "🎵";
    if (els.musicNotice && message) {
      els.musicNotice.textContent = message;
      els.musicNotice.classList.toggle("music-notice--blocked", blocked);
    }
  }

  function tryStartMusic(silentFail = true) {
    if (musicOn) return Promise.resolve();
    els.bgMusic.volume = 0.22;
    return els.bgMusic.play()
      .then(() => {
        setMusicUI(true, "🎵 Music is playing. Tap 🔇 to turn it off.");
      })
      .catch(() => {
        setMusicUI(false, "🎵 Tap Spin or the music button to start music.", true);
        if (!silentFail) toast("Tap again to allow music");
      });
  }

  function startMusicFromGesture() {
    return tryStartMusic(true);
  }

  function spin() {
    const result = chooseResult();
    startMusicFromGesture();

    fillStrip(els.strips.category, randomItemFor("category", { emoji: result.category.emoji, text: result.category.name }));
    fillStrip(els.strips.dish, randomItemFor("dish", { emoji: result.category.emoji, text: result.dish }));
    fillStrip(els.strips.challenge, randomItemFor("challenge", { emoji: "🎯", text: result.challenge }));

    els.spin.disabled = true;
    els.resultDish.textContent = "Spinning...";
    els.resultFortune.textContent = "The lunch machine is shuffling destiny.";
    els.reels.forEach((reel) => reel.classList.add("reel--spinning"));

    setTimeout(() => {
      els.reels.forEach((reel) => reel.classList.remove("reel--spinning"));
      showFinalReels(result);
      applyResult(result);
      els.spin.disabled = false;
    }, 1250);
  }

  function favoriteCurrent() {
    if (!current) return toast("Spin first");
    if (!state.favorites.includes(current.dish)) {
      state.favorites.unshift(current.dish);
      state.favorites = state.favorites.slice(0, 20);
      save();
      updateDashboard();
      toast("Added favorite");
    } else {
      toast("Already saved");
    }
  }

  function openNearby() {
    if (!current) return toast("Spin first");
    const url = "https://www.google.com/maps/search/" + encodeURIComponent(`${current.dish} near me`);
    window.open(url, "_blank");
  }

  async function shareCurrent() {
    if (!current) return toast("Spin first");
    const text = `🎰 Lunch Jackpot: ${current.dish} (${current.category.name}) • ${current.category.budget} • ${current.challenge}`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast("Copied result");
    } else {
      alert(text);
    }
  }

  function resetStats() {
    state = { total: 0, categories: {}, dishes: {}, history: [], favorites: state.favorites || [] };
    save();
    updateDashboard();
    toast("Stats reset");
  }

  function toggleMusic() {
    if (musicOn) {
      els.bgMusic.pause();
      setMusicUI(false, "🔇 Music is off. Tap 🎵 to turn it on.");
    } else {
      tryStartMusic(false);
    }
  }

  function setupTabs() {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach((item) => item.classList.remove("tab--active"));
        document.querySelectorAll(".panel").forEach((panel) => panel.classList.remove("panel--active"));
        tab.classList.add("tab--active");
        $(tab.dataset.panel).classList.add("panel--active");
      });
    });
  }

  function initReels() {
    fillStrip(els.strips.category, [{ emoji: "🍜", text: "Ready" }]);
    fillStrip(els.strips.dish, [{ emoji: "🍽️", text: "Set" }]);
    fillStrip(els.strips.challenge, [{ emoji: "🎯", text: "Spin" }]);
    Object.values(els.strips).forEach((strip) => strip.classList.add("reel__strip--final"));
  }

  window.addEventListener("load", () => tryStartMusic(true));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !musicOn) tryStartMusic(true);
  });

  els.spin.addEventListener("click", spin);
  els.music.addEventListener("click", toggleMusic);
  els.reset.addEventListener("click", resetStats);
  els.favorite.addEventListener("click", favoriteCurrent);
  els.nearby.addEventListener("click", openNearby);
  els.share.addEventListener("click", shareCurrent);
  setupTabs();
  initReels();
  updateDashboard();
})();