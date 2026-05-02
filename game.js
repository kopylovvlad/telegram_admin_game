const gameState = {
  day: 1,
  subscribers: 10,
  mental: 100,
  actionsLeft: 5,
  postsToday: 0,
  postTarget: 3,
  missStreak: 0,
  generatedMeme: null,
  over: false,
  history: [],
  ownMemes: [],
  channels: [],
  contactMessages: [
    "Бабушка: я ничего не поняла, но лайк поставила.",
    "Мама: сынок, убери мем с матом, тетя Люба читает.",
    "Жучка: *случайно нажала реакцию* и мем залетел.",
    "Внучка: ты уже не в тренде, дедуля админ.",
    "Батя: кинул твой мем в семейный чат, теперь разбор полетов.",
    "Друг: делай больше котов, это всегда работает.",
    "Подруга друга: мем смешной, но зачем там налоговая?",
    "Сестра: у тебя стиль как у 2017, но я лайкну.",
    "Брат: если украл, то хотя бы красиво укради.",
    "Бабушка: а где смешно?"
  ],
  randomEvents: [
    { text: "Рекламодатель казино дал денег и бустанул охваты.", subs: 35, mental: -12 },
    { text: "Твой мем попал в паблик-миллионник.", subs: 70, mental: -6 },
    { text: "Канал обвинили в вторичности. Народ ноет.", subs: -20, mental: -8 },
    { text: "Батя внезапно одобрил пост. Алгоритм растаял.", subs: 24, mental: 2 },
    { text: "Мама попросила удалить пост, ты проигнорил.", subs: 8, mental: -7 },
    { text: "Техсбой: половина реакций не засчиталась.", subs: -18, mental: -4 },
    { text: "Неожиданно зашел мем про кота в каске.", subs: 40, mental: 3 },
    { text: "Хейтеры устроили рейд дизлайков.", subs: -25, mental: -6 },
    { text: "Подписчик прислал шикарный мем в личку.", subs: 20, mental: 4 },
    { text: "Внучка сказала, что ты кринж, но вирусный.", subs: 14, mental: -2 },
    { text: "Друг притащил старый шаблон, но народ кайфанул.", subs: 18, mental: -1 },
    { text: "Тебя позвали в коллаб с каналом 'Элита Щитпоста'.", subs: 32, mental: -9 },
    { text: "Бабушка кинула мем всем родственникам.", subs: 12, mental: 5 },
    { text: "Тебя уличили в баянах за прошлую неделю.", subs: -22, mental: -3 },
    { text: "Алгоритм решил, что ты 'перспективный автор'.", subs: 45, mental: -5 }
  ]
};

const ownMemeTitles = [
  "Кот в каске админит 3 канала",
  "Грустный жабий менеджер контента",
  "Я и дедлайн, когда 2 минуты до поста",
  "Бабушка против постиронии",
  "Собака-комментатор щитпоста",
  "Папка memes_final_final2",
  "Мем про мем про мем",
  "Две кнопки: качество и охват",
  "Лягушка с KPI",
  "Кот с надписью 'алгоритмы, пожалуйста'",
  "Кринж, но мой",
  "Скриншот чата без контекста",
  "Сложный ироничный лор",
  "Пост без смысла, но с душой",
  "Мама увидела мем",
  "Тетя Люба ставит реакцию",
  "Гениальный провал дня",
  "Пост, который никто не понял",
  "Утренний щитпост",
  "Ночной щитпост с философией"
];

const channelsSeed = [
  { name: "Кринж Дейли", tone: "Плохо, но стабильно", risk: "Низкий" },
  { name: "Мемы Для Нормисов", tone: "Рост, но больно", risk: "Средний" },
  { name: "Постирония 18+", tone: "Непредсказуемо", risk: "Высокий" },
  { name: "Батин Юмор", tone: "Редко, но метко", risk: "Низкий" },
  { name: "Элита Щитпоста", tone: "Риск/прибыль", risk: "Высокий" }
];

const els = {
  dayLabel: document.getElementById("dayLabel"),
  actionsLabel: document.getElementById("actionsLabel"),
  postsLabel: document.getElementById("postsLabel"),
  subsValue: document.getElementById("subsValue"),
  mentalValue: document.getElementById("mentalValue"),
  streakValue: document.getElementById("streakValue"),
  chatFeed: document.getElementById("chatFeed"),
  historyFeed: document.getElementById("historyFeed"),
  channelsList: document.getElementById("channelsList"),
  ownMemesList: document.getElementById("ownMemesList"),
  generatedBox: document.getElementById("generatedBox"),
  overlay: document.getElementById("overlay"),
  endingTitle: document.getElementById("endingTitle"),
  endingText: document.getElementById("endingText")
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  return list[randomInt(0, list.length - 1)];
}

function clampStats() {
  gameState.mental = Math.max(0, Math.min(100, gameState.mental));
  gameState.subscribers = Math.max(0, gameState.subscribers);
}

function addLog(text, toHistory = true) {
  const line = `[День ${gameState.day}] ${text}`;
  const p = document.createElement("p");
  p.textContent = line;
  els.chatFeed.prepend(p);

  if (toHistory) {
    gameState.history.unshift(line);
  }
  renderHistory();
}

function renderHistory() {
  els.historyFeed.innerHTML = "";
  gameState.history.slice(0, 80).forEach((entry) => {
    const p = document.createElement("p");
    p.textContent = entry;
    els.historyFeed.appendChild(p);
  });
}

function makeContent() {
  gameState.ownMemes = ownMemeTitles.map((title, idx) => ({
    id: `own-${idx + 1}`,
    title,
    quality: pickRandom(["плохой", "нормальный", "легендарный"]),
    trend: pickRandom(["низкая", "средняя", "высокая"]),
    cringe: pickRandom(["низкий", "средний", "высокий"])
  }));

  gameState.channels = channelsSeed.map((item, idx) => {
    const memes = Array.from({ length: 6 }, (_, i) => ({
      id: `ch-${idx + 1}-${i + 1}`,
      title: `${item.name}: мем #${i + 1}`,
      trend: pickRandom(["низкая", "средняя", "высокая"]),
      quality: pickRandom(["плохой", "нормальный", "легендарный"])
    }));
    return { ...item, memes };
  });
}

function renderCollections() {
  els.ownMemesList.innerHTML = "";
  gameState.ownMemes.forEach((meme) => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <h4>${meme.title}</h4>
      <p>Качество: ${meme.quality}</p>
      <p>Трендовость: ${meme.trend}</p>
      <p>Кринж: ${meme.cringe}</p>
    `;
    els.ownMemesList.appendChild(card);
  });

  els.channelsList.innerHTML = "";
  gameState.channels.forEach((channel) => {
    const card = document.createElement("article");
    card.className = "card";
    const sample = pickRandom(channel.memes).title;
    card.innerHTML = `
      <h4>${channel.name}</h4>
      <p>Стиль: ${channel.tone}</p>
      <p>Риск: ${channel.risk}</p>
      <p>Пример мема: ${sample}</p>
    `;
    els.channelsList.appendChild(card);
  });
}

function spendAction() {
  if (gameState.over) return false;
  if (gameState.actionsLeft <= 0) {
    addLog("Действия закончились. Заверши день в браузере.");
    return false;
  }
  gameState.actionsLeft -= 1;
  return true;
}

function applyResults({ subs = 0, mental = 0, message }) {
  gameState.subscribers += subs;
  gameState.mental += mental;
  gameState.postsToday += 1;
  clampStats();
  addLog(`${message} (${subs >= 0 ? "+" : ""}${subs} подпищиков, ${mental >= 0 ? "+" : ""}${mental} менталки)`);
  updateUI();
  checkGameState();

  if (!gameState.over && gameState.actionsLeft === 0) {
    addLog("День закончился.");
    endDay();
  }
}

function postOwnCringe() {
  if (!spendAction()) return;
  const meme = pickRandom(gameState.generatedMeme ? [...gameState.ownMemes, gameState.generatedMeme] : gameState.ownMemes);
  let subsDelta = -randomInt(5, 20);
  let mentalDelta = 10;
  let text = `Ты запостил свой кринж: "${meme.title}".`;

  if (Math.random() < 0.12) {
    const bonus = randomInt(20, 60);
    subsDelta = bonus;
    text += " Внезапно залетело.";
  }

  applyResults({ subs: subsDelta, mental: mentalDelta, message: text });
}

function postRepost() {
  if (!spendAction()) return;
  const channel = pickRandom(gameState.channels);
  const meme = pickRandom(channel.memes);
  const subsDelta = randomInt(10, 40);
  const mentalDelta = -15;
  const text = `Честный репост из "${channel.name}": "${meme.title}".`;
  applyResults({ subs: subsDelta, mental: mentalDelta, message: text });
}

function postStolen() {
  if (!spendAction()) return;
  const channel = pickRandom(gameState.channels);
  const meme = pickRandom(channel.memes);
  const roll = Math.random();
  let subsDelta = 0;
  let mentalDelta = -8;
  let text = `Украден мем из "${channel.name}": "${meme.title}".`;

  if (roll < 0.5) {
    subsDelta = randomInt(20, 60);
    text += " Народ кайфанул и не заметил.";
  } else if (roll < 0.75) {
    subsDelta = -randomInt(10, 30);
    text += " Мем не зашел.";
  } else {
    if (Math.random() < 0.5) {
      mentalDelta -= 15;
      text += " Тебя спалили, стыд съел менталку.";
    } else {
      subsDelta = -randomInt(15, 35);
      text += " Тебя спалили, аудитория уходит.";
    }
  }

  applyResults({ subs: subsDelta, mental: mentalDelta, message: text });
}

function generateMeme() {
  if (!spendAction()) return;
  const adjectives = ["нервный", "абсурдный", "пиксельный", "батин", "метаироничный", "запрещенный", "легендарный"];
  const nouns = ["кот", "админ", "алгоритм", "дедлайн", "комментатор", "подписчик", "маркетолог"];
  const meme = {
    id: `gen-${Date.now()}`,
    title: `${pickRandom(adjectives)} ${pickRandom(nouns)} в панике`,
    quality: pickRandom(["нормальный", "легендарный"]),
    trend: pickRandom(["средняя", "высокая"]),
    cringe: pickRandom(["средний", "высокий"])
  };
  gameState.generatedMeme = meme;
  els.generatedBox.textContent = `Сгенерировано: "${meme.title}". Можно постить как свой кринж.`;
  addLog(`Браузер сгенерил новый мем: "${meme.title}".`, false);
  updateUI();

  if (!gameState.over && gameState.actionsLeft === 0) {
    addLog("День закончился.");
    endDay();
  }
}

function triggerRandomEvent() {
  if (Math.random() > 0.7) {
    const event = pickRandom(gameState.randomEvents);
    gameState.subscribers += event.subs;
    gameState.mental += event.mental;
    clampStats();
    addLog(`Событие: ${event.text} (${event.subs >= 0 ? "+" : ""}${event.subs} подпищиков, ${event.mental >= 0 ? "+" : ""}${event.mental} менталки)`);
  }
}

function triggerContactMessage() {
  addLog(pickRandom(gameState.contactMessages), false);
}

function endDay() {
  if (gameState.over) return;

  if (gameState.postsToday < gameState.postTarget) {
    gameState.missStreak += 1;
    const missing = gameState.postTarget - gameState.postsToday;
    // Мягкий штраф: первый пропуск не должен мгновенно убивать ран.
    const penaltySubs = 3 * missing + gameState.missStreak * 2;
    const penaltyMental = 2 + gameState.missStreak;
    gameState.subscribers -= penaltySubs;
    gameState.mental -= penaltyMental;
    addLog(`Норма не выполнена (${gameState.postsToday}/${gameState.postTarget}). Потеря: -${penaltySubs} подпищиков, -${penaltyMental} менталки.`);
  } else {
    gameState.missStreak = 0;
    addLog(`Норма выполнена (${gameState.postsToday}/${gameState.postTarget}). Канал живет.`);
  }

  triggerRandomEvent();
  triggerContactMessage();
  clampStats();
  checkGameState();
  if (gameState.over) return;

  gameState.day += 1;
  gameState.actionsLeft = 5;
  gameState.postsToday = 0;

  if (gameState.day % 4 === 0 && gameState.postTarget < 5) {
    gameState.postTarget += 1;
    addLog(`Алгоритмы злеют: дневная норма теперь ${gameState.postTarget} поста(ов).`);
  }

  updateUI();
}

function checkGameState() {
  clampStats();

  if (gameState.mental <= 0) {
    finishGame(
      "Концовка: ушел в монастырь",
      "Менталка упала до 0%. Админ удалил канал и ушел спать на 4 дня без интернета."
    );
    return;
  }

  if (gameState.subscribers <= 0) {
    finishGame(
      "Концовка: семейный чат",
      "Подпищики закончились. Канал снова читают только мама и бабушка."
    );
    return;
  }

  if (gameState.subscribers >= 1000) {
    if (gameState.mental >= 60) {
      finishGame(
        "Концовка: легенда щитпоста",
        "Ты набрал 1000 подпищиков и сохранил менталку. Редкий вид админа."
      );
    } else {
      finishGame(
        "Концовка: успешный, но пустой",
        "Ты добился 1000 подпищиков, но менталка на нуле эмоций. Карьера есть, радости нет."
      );
    }
  }
}

function finishGame(title, text) {
  gameState.over = true;
  els.endingTitle.textContent = title;
  els.endingText.textContent = `${text}\n\nИтог: \n\n- ${gameState.subscribers} подпищиков \n\n-${gameState.mental}% менталки \n\n- продержался ${gameState.day} дн.`;
  els.overlay.classList.remove("hidden");
  updateUI();
}

function updateUI() {
  els.dayLabel.textContent = `День ${gameState.day}`;
  els.actionsLabel.textContent = `Действий: ${gameState.actionsLeft}`;
  els.postsLabel.textContent = `Постов: ${gameState.postsToday}/${gameState.postTarget}`;
  els.subsValue.textContent = String(gameState.subscribers);
  els.mentalValue.textContent = `${gameState.mental}%`;
  els.streakValue.textContent = String(gameState.missStreak);

  const disabled = gameState.over || gameState.actionsLeft <= 0;
  document.getElementById("postOwnBtn").disabled = disabled;
  document.getElementById("repostBtn").disabled = disabled;
  document.getElementById("stealBtn").disabled = disabled;
  document.getElementById("generateBtn").disabled = disabled;
}

function setupDesktopWindows() {
  const windows = Array.from(document.querySelectorAll(".window"));
  const buttons = Array.from(document.querySelectorAll(".icon-btn"));
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.window;
      windows.forEach((w) => w.classList.toggle("active", w.id === target));
    });
  });
}

function resetGame() {
  gameState.day = 1;
  gameState.subscribers = 10;
  gameState.mental = 100;
  gameState.actionsLeft = 5;
  gameState.postsToday = 0;
  gameState.postTarget = 3;
  gameState.missStreak = 0;
  gameState.generatedMeme = null;
  gameState.over = false;
  gameState.history = [];
  els.chatFeed.innerHTML = "";
  els.generatedBox.textContent = "Пока ничего не сгенерировано.";
  els.overlay.classList.add("hidden");
  makeContent();
  renderCollections();
  addLog("Старт: у тебя 10 подпищиков (включая бабушку и кота).");
  updateUI();
}

function init() {
  makeContent();
  renderCollections();
  setupDesktopWindows();
  addLog("Старт: у тебя 10 подпищиков (мама, батя, бабушка и питомцы).");
  updateUI();

  document.getElementById("postOwnBtn").addEventListener("click", postOwnCringe);
  document.getElementById("repostBtn").addEventListener("click", postRepost);
  document.getElementById("stealBtn").addEventListener("click", postStolen);
  document.getElementById("generateBtn").addEventListener("click", generateMeme);
  document.getElementById("nextDayBtn").addEventListener("click", endDay);
  document.getElementById("restartBtn").addEventListener("click", resetGame);
}

init();
