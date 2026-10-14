// Roadkick — translations (RU source → EN, CS) and language switching
'use strict';

const LANGS = ['ru', 'en', 'cs'];
const LOCALE = { ru: 'ru-RU', en: 'en-US', cs: 'cs-CZ' };

// key = Russian source text exactly as it appears in the game; value = [en, cs]
const DICT = {
  // page / HUD / pad
  'Roadkick — пиксельная мотогонка': ['Roadkick — pixel moto racing', 'Roadkick — pixelové motozávody'],
  'Игровое поле': ['Game screen', 'Herní plocha'],
  'место': ['pos', 'pořadí'], 'круг': ['lap', 'kolo'], 'км/ч': ['km/h', 'km/h'], 'лимит': ['limit', 'limit'],
  'полиция': ['police', 'policie'],
  'Газ': ['Throttle', 'Plyn'], 'газ': ['gas', 'plyn'], 'Влево': ['Left', 'Doleva'], 'Вправо': ['Right', 'Doprava'],
  'руль': ['steer', 'řízení'], 'Тормоз': ['Brake', 'Brzda'], 'тормоз': ['brake', 'brzda'],
  'Дрон': ['Drone', 'Dron'], 'нет дрона': ['no drone', 'bez dronu'], 'Нитро': ['Nitro', 'Nitro'], 'нет нитро': ['no nitro', 'bez nitra'],
  'День или ночь': ['Day or night', 'Den nebo noc'], 'ночь': ['night', 'noc'], 'день': ['day', 'den'], 'всегда': ['always', 'vždy'],
  'Пинок': ['Kick', 'Kop'], 'пинок': ['kick', 'kop'], 'Пробел': ['Space', 'Mezerník'],
  'запуск': ['launch', 'start'], 'буст': ['boost', 'boost'],
  'Музыка': ['Music', 'Hudba'], 'Музыка (B)': ['Music (B)', 'Hudba (B)'], 'Звук': ['Sound', 'Zvuk'], 'Звук (M)': ['Sound (M)', 'Zvuk (M)'],
  'Пауза': ['Pause', 'Pauza'], 'Пауза (P)': ['Pause (P)', 'Pauza (P)'], 'Продолжить': ['Resume', 'Pokračovat'],
  // menu
  'Два круга, семь соперников и полиция, которая следит за скоростью.': ['Two laps, seven rivals and police watching your speed.', 'Dvě kola, sedm soupeřů a policie, která hlídá rychlost.'],
  'Трасса': ['Track', 'Trať'],
  'Управление на экране: стрелки — руль, газ, тормоз; пробел — пинок; ↓ в прыжке — сальто; F — дрон, C — нитро; N — день или ночь.':
    ['Controls: arrows steer, gas and brake; Space kicks; ↓ in the air flips; F drone, C nitro; N day or night.',
     'Ovládání: šipky řízení, plyn a brzda; mezerník kop; ↓ ve skoku salto; F dron, C nitro; N den nebo noc.'],
  'Превью трассы': ['Track preview', 'Náhled trati'],
  'Поехали': ['Ride', 'Jedeme'], 'Финиш': ['Finish', 'Cíl'], 'Победа': ['Victory', 'Vítězství'],
  'Ещё заезд': ['Race again', 'Znovu'], 'Выбрать трассу': ['Choose track', 'Vybrat trať'],
  'Поверни телефон горизонтально — так дорога шире.': ['Turn your phone sideways — the road is wider that way.', 'Otoč telefon na šířku — silnice bude širší.'],
  'Рекорда пока нет': ['No record yet', 'Zatím bez rekordu'], 'Язык': ['Language', 'Jazyk'],
  // tracks
  'Горный серпантин': ['Mountain Pass', 'Horské serpentiny'], 'хвойный лес, виражи': ['pine forest, hairpins', 'jehličnatý les, zatáčky'],
  'Солнце, хвойный лес и крутые виражи с перепадами высот. Днём или ночью — решаешь сам.':
    ['Sunshine, pine forest and steep hairpins with big elevation changes. Day or night — your call.', 'Slunce, jehličnatý les a ostré zatáčky s převýšením. Ve dne nebo v noci — rozhodni sám.'],
  'Ночной город': ['Night City', 'Noční město'], 'неон, фонари, пробки': ['neon, streetlights, traffic', 'neony, lampy, zácpy'],
  'Неон, фонари и плотный трафик с такси и автобусами. Длинные проспекты, эстакады и резкие повороты на перекрёстках. Здесь всегда ночь.':
    ['Neon, streetlights and heavy traffic with taxis and buses. Long avenues, overpasses and sharp turns at junctions. It is always night here.', 'Neony, lampy a hustý provoz s taxíky a autobusy. Dlouhé třídy, estakády a ostré zatáčky na křižovatkách. Tady je vždycky noc.'],
  'Пустыня': ['Desert', 'Poušť'], 'дюны, кактусы, фуры': ['dunes, cacti, trucks', 'duny, kaktusy, kamiony'],
  'Раскалённое шоссе среди дюн и красных столовых гор. Длинные прямые, где легко разогнаться — и так же легко нарваться на полицию. Днём или ночью — решаешь сам.':
    ['A scorching highway among dunes and red mesas. Long straights where it is easy to speed up — and just as easy to run into the police. Day or night — your call.', 'Rozpálená silnice mezi dunami a rudými stolovými horami. Dlouhé rovinky, kde se snadno rozjedeš — a stejně snadno narazíš na policii. Ve dne nebo v noci — rozhodni sám.'],
  'Прага': ['Prague', 'Praha'], 'брусчатка, трамваи, мосты': ['cobbles, trams, bridges', 'dlažba, tramvaje, mosty'],
  'Старый город под Пражским градом: брусчатка трясёт байк, по центру ходят трамваи, газовые фонари и мост со статуями над рекой. Днём или ночью — решаешь сам.':
    ['The Old Town below Prague Castle: cobbles shake the bike, trams run down the middle, gas lamps and a bridge with statues over the river. Day or night — your call.', 'Staré Město pod Pražským hradem: dlažba třese motorkou, středem jezdí tramvaje, plynové lampy a most se sochami nad řekou. Ve dne nebo v noci — rozhodni sám.'],
  'Трюковой каньон': ['Stunt Canyon', 'Kaskadérský kaňon'], 'трамплины, обрывы, реки': ['ramps, cliffs, rivers', 'skokánky, srázy, řeky'],
  'Экстрим-маршрут через каньон: трамплины, пропасти и реки, которые нужно перелетать, плюс обрыв и серия кочек. Разгоняйся перед трамплином: медленно не перепрыгнуть, а упасть — значит проиграть.':
    ['An extreme route through the canyon: ramps, chasms and rivers to jump, plus a cliff and a run of bumps. Speed up before each ramp: too slow and you won’t make it, and a fall means you lose.', 'Extrémní trasa kaňonem: skokánky, propasti a řeky, které musíš přeletět, plus sráz a série hrbolů. Před skokánkem zrychli: pomalu to nepřeskočíš a pád znamená prohru.'],
  // weather
  'Дождь': ['Rain', 'Déšť'], 'Туман': ['Fog', 'Mlha'], 'Песчаная буря': ['Sandstorm', 'Písečná bouře'],
  // callouts
  'Комбо сгорело': ['Combo lost', 'Kombo propadlo'], 'Копы на хвосте!': ['Cops on your tail!', 'Policie za tebou!'], 'Подкрепление!': ['Backup!', 'Posily!'],
  'Сальто!': ['Flip!', 'Salto!'], 'Двойное сальто!': ['Double flip!', 'Dvojité salto!'], 'Тройное сальто!': ['Triple flip!', 'Trojité salto!'],
  'Сальто': ['Flip', 'Salto'], 'Не докрутил!': ['Under-rotated!', 'Nedotočil jsi!'], 'Полёт!': ['Big air!', 'Let!'], 'Полёт': ['Big air', 'Let'],
  'Авария!': ['Crash!', 'Nehoda!'], 'Копа — в кювет!': ['Cop in the ditch!', 'Policajt v příkopu!'], 'Коп в кювете': ['Cop ditched', 'Policajt v příkopu'],
  'Бац!': ['Wham!', 'Bum!'], 'Дрон в воздухе': ['Drone airborne', 'Dron ve vzduchu'], 'Дрон улетел': ['Drone gone', 'Dron odletěl'],
  'Нитро! Жми C': ['Nitro! Press C', 'Nitro! Stiskni C'], 'Дрон! Жми F': ['Drone! Press F', 'Dron! Stiskni F'], 'Нитро!': ['Nitro!', 'Nitro!'],
  'Попал!': ['Hit!', 'Zásah!'], 'Пейнтбол': ['Paintball', 'Paintball'], 'Вперёд!': ['Go!', 'Jeď!'], 'Обгон': ['Overtake', 'Předjetí'],
  'На волоске': ['Close call', 'O chlup'], 'Прижимают!': ['Boxed in!', 'Tlačí tě!'], 'Розыск ниже': ['Heat down', 'Pátrání slábne'],
  'Сбросил хвост': ['Lost the tail', 'Setřásl jsi je'], 'Ушёл от погони': ['Escaped the chase', 'Unikl jsi honičce'],
  'Последний круг': ['Final lap', 'Poslední kolo'], 'Финиш!': ['Finish!', 'Cíl!'], 'Попался': ['Busted', 'Dopaden'],
  'Ай!': ['Ouch!', 'Au!'],
  'Бултых!': ['Splash!', 'Žbluňk!'], 'Обрыв!': ['Cliff!', 'Sráz!'],
  'Байк на дне Влтавы': ['Bike at the bottom of the Vltava', 'Motorka na dně Vltavy'],
  'Байк унесло течением': ['The current took the bike', 'Motorku odnesl proud'],
  'Байк улетел в пропасть': ['The bike fell into the chasm', 'Motorka spadla do propasti'],
  'На мосту не выезжай за парапет: за ним сразу река. Держись дороги, особенно когда толкаются соседи.':
    ['On the bridge, don’t go past the parapet: the river is right behind it. Stay on the road, especially when rivals shove you.', 'Na mostě nevyjížděj za zábradlí: hned za ním je řeka. Drž se silnice, hlavně když se soupeři strkají.'],
  'Не долетел до берега. Перед трамплином держи газ до упора — нужно от 115 км/ч.':
    ['You didn’t reach the bank. Hold full throttle before the ramp — you need 115 km/h or more.', 'Nedoletěl jsi na břeh. Před skokánkem drž plný plyn — potřebuješ aspoň 115 km/h.'],
  'Не хватило скорости на трамплине. Разгоняйся заранее и держи газ до самого края.':
    ['Not enough speed on the ramp. Build speed early and hold the throttle right to the edge.', 'Na skokánku chyběla rychlost. Rozjeď se včas a drž plyn až k okraji.'],
  'Полиция забрала права': ['The police took your licence', 'Policie ti vzala řidičák'],
  'Нарушения копятся выше 130 км/ч. Сбрось скорость, пока шкала не заполнилась, или уходи от погони: машину обгоняют на полном газу, мотоциклистов сбивают пинком.':
    ['Violations build up above 130 km/h. Slow down before the bar fills, or outrun the chase: pass the car at full throttle and kick the motorcycle cops off.', 'Přestupky se sčítají nad 130 km/h. Zpomal, než se ukazatel naplní, nebo ujeď: auto předjedeš na plný plyn, motorkáře srazíš kopem.'],
  'На радаре': ['On the radar', 'Na radaru'], 'Хвост растёт': ['Tail growing', 'Pronásledování sílí'], 'Ты — главная цель': ['You are target #1', 'Jsi hlavní cíl'],
  'Мигалка на хвосте': ['Siren behind you', 'Maják za tebou'], 'Берут в клещи': ['Closing in', 'Berou tě do kleští'],
  'Весь участок за тобой': ['The whole precinct is after you', 'Celá stanice jde po tobě'], 'Дышат в спину!': ['Right behind you!', 'Dýchají ti na záda!'],
  // rivals
  'Бешеный Макс': ['Mad Max', 'Šílený Max'], 'Лиса': ['Fox', 'Liška'], 'Бульдог': ['Bulldog', 'Buldok'], 'Шустрик': ['Zippy', 'Šmudla'],
  'Вдова': ['Widow', 'Vdova'], 'Профи': ['Pro', 'Profík'], 'Дед': ['Gramps', 'Děda'],
  'Сейчас полетишь!': ['You’re going flying!', 'Teď poletíš!'], 'Это моя дорога!': ['This is my road!', 'Tohle je moje silnice!'],
  'Удачи, новичок.': ['Good luck, rookie.', 'Hodně štěstí, nováčku.'], 'Не отставай.': ['Keep up.', 'Nezaostávej.'],
  'Только тронь меня.': ['Just try touching me.', 'Jen na mě sáhni.'], 'Я просто прокатиться…': ['I’m just out for a ride…', 'Já se jen projíždím…'],
  'Оглядывайся почаще.': ['Watch your back.', 'Dívej se za sebe.'], 'Где тут газ?': ['Where’s the throttle?', 'Kde je tu plyn?'],
  'Ещё увидимся!': ['See you again!', 'Ještě se uvidíme!'], 'Ты труп!': ['You’re dead!', 'Jsi mrtvej!'], 'Неплохо.': ['Not bad.', 'Není to špatné.'],
  'Посмотрим на финише.': ['We’ll see at the finish.', 'Uvidíme v cíli.'], 'Догоню!': ['I’ll catch you!', 'Dohoním tě!'],
  'Проезжай, проезжай…': ['Go on, go on…', 'Jeď, jeď…'], 'Ну-ну.': ['Sure, sure.', 'No jo.'], 'Эй, подожди!': ['Hey, wait!', 'Hej, počkej!'],
  'Ах ты!': ['Why you!', 'Ty jeden!'], 'Ну всё!': ['That’s it!', 'Tak dost!'], 'Грязно играешь.': ['You play dirty.', 'Hraješ špinavě.'],
  'Ну всё, держись!': ['That’s it, hold on!', 'Tak a teď se drž!'], 'Ты это зря.': ['Big mistake.', 'To sis neměl dovolit.'],
  'За что?!': ['What for?!', 'Za co?!'], 'Мама!': ['Mommy!', 'Mami!'], 'Запомнила тебя.': ['I’ll remember you.', 'Zapamatuju si tě.'],
  'Ой-ой-ой!': ['Oh no no no!', 'Ou ou ou!'], 'Получай!': ['Take that!', 'Tady máš!'], 'Сиди дома!': ['Stay home!', 'Seď doma!'],
  'Прости, бизнес.': ['Sorry, business.', 'Promiň, byznys.'], 'Это тебе за пинок!': ['That’s for the kick!', 'To máš za ten kop!'],
  'Ой, случайно.': ['Oops, accident.', 'Jé, omylem.'], 'Сюрприз!': ['Surprise!', 'Překvápko!'], 'Я не хотел!': ['I didn’t mean to!', 'Já nechtěl!'],
};

// templated strings: [regex on the Russian text, builder(lang index, ...groups)]
const PATTERNS = [
  [/^(.+) \+нитро$/, (i, a) => `${T(a)} +nitro`],
  [/^(\d+)× сальто!$/, (i, n) => [`${n}× flip!`, `${n}× salto!`][i]],
  [/^Сальто ×(\d+)$/, (i, n) => [`Flip ×${n}`, `Salto ×${n}`][i]],
  [/^буст (\d+)$/, (i, n) => `boost ${n}`],
  [/^огонь (\d+)$/, (i, n) => [`fire ${n}`, `palba ${n}`][i]],
];

let LANG = 'ru';
try { LANG = localStorage.getItem('roadkick-lang') || ''; } catch (e) {}
if (!LANGS.includes(LANG)) {
  // auto-pick from the browser: Czech or Slovak → cs, Russian/Ukrainian/Belarusian → ru, everything else → en
  const nav = (navigator.languages || [navigator.language || 'en']).map(l => l.toLowerCase().slice(0, 2));
  const hit = nav.find(l => ['ru', 'uk', 'be', 'cs', 'sk', 'en'].includes(l)) || 'en';
  LANG = { uk: 'ru', be: 'ru', sk: 'cs' }[hit] || hit;
}

function T(s) {
  if (LANG === 'ru' || s == null || s === '') return s;
  const i = LANG === 'en' ? 0 : 1;
  const d = DICT[s];
  if (d) return d[i];
  for (const [re, f] of PATTERNS) { const m = re.exec(s); if (m) return f(i, ...m.slice(1)); }
  return s;
}
// pick a ready phrase per language: L('ru', 'en', 'cs')
const L = (...v) => v[LANGS.indexOf(LANG)];
const fmtNum = n => n.toLocaleString(LOCALE[LANG]);

// static page text: remember each Russian original once, then swap in the translation
const staticNodes = [];
function collectStatic() {
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) {
    const src = n.nodeValue.trim();
    if (src && DICT[src]) staticNodes.push({ n, src, raw: n.nodeValue });
  }
  document.querySelectorAll('[aria-label],[title]').forEach(el => {
    for (const a of ['aria-label', 'title']) {
      const v = el.getAttribute(a);
      if (v && DICT[v]) staticNodes.push({ el, a, src: v });
    }
  });
}
function applyStatic() {
  for (const s of staticNodes) {
    if (s.el) s.el.setAttribute(s.a, T(s.src));
    else s.n.nodeValue = s.raw.replace(s.src, T(s.src));
  }
  document.title = T('Roadkick — пиксельная мотогонка');
  document.documentElement.lang = LANG;
  document.querySelectorAll('.lang-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)));
}
function setLang(l) {
  LANG = l;
  try { localStorage.setItem('roadkick-lang', l); } catch (e) {}
  applyStatic();
  if (typeof onLangChange === 'function') onLangChange();
}
collectStatic();
applyStatic();
document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
