const game = document.querySelector("#game");
const resume = document.querySelector("#resume");
const parcels = [...game.querySelectorAll(".parcel")];
const meter = [...game.querySelectorAll(".meter i")];
const count = document.querySelector("#count");
const announce = document.querySelector("#announce");
const replay = document.querySelector("#replay");
let collected = 0;
let finishTimer;

function remember(value) {
  try { sessionStorage.setItem("pickup-seen", value); } catch {}
}

function showResume(target, focus = true) {
  clearTimeout(finishTimer);
  game.hidden = true;
  resume.hidden = false;
  replay.hidden = false;
  remember("1");
  if (focus) {
    const destination = document.querySelector(target) || document.querySelector("#name");
    destination.setAttribute("tabindex", "-1");
    destination.focus({ preventScroll: true });
    if (target === "#name") window.scrollTo(0, 0);
    else destination.scrollIntoView({ block: "start" });
  }
}

function startGame(focus = true) {
  clearTimeout(finishTimer);
  collected = 0;
  parcels.forEach((parcel, index) => {
    parcel.setAttribute("aria-pressed", "false");
    parcel.setAttribute("aria-label", "A–0" + (index + 1) + " · Открыть посылку " + (index + 1));
    meter[index].classList.remove("filled");
  });
  count.textContent = "0 / 6";
  announce.textContent = "Посылки приехали. Можно забирать!";
  game.hidden = false;
  resume.hidden = true;
  replay.hidden = true;
  if (focus) {
    history.replaceState(null, "", location.pathname + location.search);
    window.scrollTo(0, 0);
    document.querySelector("#game-title").focus({ preventScroll: true });
  }
}

parcels.forEach((parcel, index) => {
  parcel.addEventListener("click", () => {
    if (parcel.getAttribute("aria-pressed") === "true") return;
    parcel.setAttribute("aria-pressed", "true");
    parcel.setAttribute("aria-label", "A–0" + (index + 1) + " · " + parcel.dataset.skill + ". Посылка открыта");
    meter[collected].classList.add("filled");
    collected += 1;
    count.textContent = collected + " / " + parcels.length;
    announce.textContent = collected + " из 6. " + parcel.dataset.fact;
    if (collected === parcels.length) {
      announce.textContent += " Заказ собран. Открываю резюме!";
      finishTimer = setTimeout(() => showResume("#name"), 2900);
    }
  });
});
document.querySelectorAll('a[href="#name"], a[href="#contact"]').forEach(link => {
  link.addEventListener("click", event => {
    if (game.hidden) return;
    event.preventDefault();
    showResume(link.hash);
    history.replaceState(null, "", link.hash);
  });
});
replay.addEventListener("click", () => startGame());
let seen = false;
try { seen = sessionStorage.getItem("pickup-seen") === "1"; } catch {}
if (seen || location.hash) showResume("#name", false);
else startGame(false);

const favorite = document.querySelector("#favorite");
function paintFavorite(on) {
  favorite.setAttribute("aria-pressed", String(on));
  favorite.firstElementChild.textContent = on ? "♥" : "♡";
  document.querySelector("#fav-label").textContent = on ? "В избранном" : "В избранное";
}
favorite.hidden = false;
try { paintFavorite(localStorage.getItem("pickup-favorite") === "1"); } catch {}
favorite.addEventListener("click", () => {
  const on = favorite.getAttribute("aria-pressed") !== "true";
  paintFavorite(on);
  try { localStorage.setItem("pickup-favorite", on ? "1" : "0"); } catch {}
});

const search = document.querySelector("#search");
const query = document.querySelector("#query");
const results = document.querySelector("#results");
const entries = [
  ["Опыт работы", "#route", document.querySelector("#route").textContent],
  ["Технические навыки", "#skills", document.querySelector(".spec").textContent],
  ["Образование и награды", "#education", document.querySelector("#education").textContent],
  ["Контакты", "#contact", "почта email написать связаться apupro5@gmail.com"],
  ["Резюме и PDF", "#name", "скачать Артем Пустовой профиль Краснодар Android"]
];
search.hidden = false;
function displayResults() {
  const term = query.value.trim().toLocaleLowerCase("ru");
  results.replaceChildren();
  if (!term) { results.hidden = true; return; }
  for (const [title, target, text] of entries) {
    if (!(title + " " + text).toLocaleLowerCase("ru").includes(term)) continue;
    const link = document.createElement("a");
    link.href = target;
    link.textContent = title;
    link.addEventListener("click", event => {
      event.preventDefault();
      if (target === "#education") document.querySelector(target).open = true;
      showResume(target);
      history.replaceState(null, "", target);
      results.hidden = true;
    });
    results.append(link);
  }
  if (!results.children.length) results.textContent = "Совпадений нет";
  results.hidden = false;
}
query.addEventListener("input", displayResults);
query.addEventListener("focus", displayResults);
search.addEventListener("submit", event => {
  event.preventDefault();
  displayResults();
  const link = results.querySelector("a");
  if (link) link.click(); else query.focus();
});
search.addEventListener("keydown", event => {
  if (event.key === "Escape") { results.hidden = true; query.focus(); }
});
document.addEventListener("click", event => {
  if (!search.contains(event.target)) results.hidden = true;
});
search.addEventListener("focusout", event => {
  if (!search.contains(event.relatedTarget)) results.hidden = true;
});

document.documentElement.classList.remove("boot", "first-visit");
