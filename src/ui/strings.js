// @ts-check
/**
 * All user-facing text, in every supported language. Placeholders use `{name}`.
 * A value may be a plural object ({ one, few, many, other }) chosen by the `n` parameter
 * with `Intl.PluralRules` for the active language.
 * @module ui/strings
 */

/** @typedef {'en' | 'uk' | 'de'} LanguageCode */
/** @typedef {string | Partial<Record<Intl.LDMLPluralRule, string>>} StringValue */

/** @type {ReadonlyArray<{ code: LanguageCode, label: string, locale: string }>} */
export const LANGUAGES = Object.freeze([
  { code: 'en', label: 'English', locale: 'en-GB' },
  { code: 'uk', label: 'Українська', locale: 'uk-UA' },
  { code: 'de', label: 'Deutsch', locale: 'de-DE' },
]);

/** @type {LanguageCode} */
export const DEFAULT_LANGUAGE = 'en';

const en = {
  appTitle: 'Check-in Calculator',
  appTagline: 'Find out exactly when online check-in opens for your flight.',

  settingsButton: 'Settings',
  settingsTitle: 'Settings',
  settingsTheme: 'Theme',
  themeSystem: 'System default',
  themeLight: 'Light',
  themeDark: 'Dark',
  settingsLanguage: 'Language',
  settingsClose: 'Done',

  airportLabel: 'Departure airport',
  airportPlaceholder: 'IATA code, airport or city, e.g. LHR',
  airportHint: 'Type the 3-letter IATA code or start typing the airport or city name.',
  airportsLoading: 'Loading the airport list…',
  airportNoResults: 'No airports match “{query}”.',
  airportTimeZone: 'Time zone: {zone}',
  dataError: 'The airport list could not be loaded. {error}',
  retry: 'Retry',

  departureLabel: 'Scheduled departure',
  departureHint: 'Local time at the departure airport, as printed on your ticket.',
  departureInvalid: 'Enter a valid date and time.',

  periodLabel: 'Check-in opens before departure',
  tabHours: 'Hours',
  tabDays: 'Days',
  presetsLabel: 'Presets',
  presetHours: '{n} h',
  presetDays: { one: '{n} day', other: '{n} days' },
  customLabel: 'Custom',
  customPlaceholder: 'e.g. 20',
  unitHours: 'hours',
  unitDays: 'days',
  periodErrorEmpty: 'Enter a number.',
  periodErrorNotInteger: 'Enter a whole number.',
  periodErrorRange: 'Enter a number between {min} and {max}.',

  zoneLabel: 'Show times in',
  zoneFollowAirport: 'Same as the airport',
  zoneFollowAirportWith: 'Same as the airport ({zone})',
  zoneUseDevice: 'Use my device time zone',
  zoneSelectLabel: 'Your time zone',
  zoneGroupOther: 'Other',

  resultPlaceholder:
    'Choose an airport, enter the departure time and pick a check-in window to see when check-in opens.',
  resultTitle: 'Online check-in opens',
  airportTime: 'Airport time · {zone}',
  yourTime: 'Your time · {zone}',
  localTime: 'Local time at {iata} · {zone}',
  statusBefore: 'Opens in',
  statusOpen: 'Check-in is open',
  statusOpenedAgo: 'opened {ago} ago',
  statusDeparted: 'This flight has already departed.',
  diffAhead: 'Your time zone is {diff} ahead of the airport when check-in opens.',
  diffBehind: 'Your time zone is {diff} behind the airport when check-in opens.',
  diffSame: 'Your time zone has the same UTC offset as the airport when check-in opens.',
  diffChanges:
    'Note: at departure the difference will be {diff}, because a daylight-saving change falls in between.',
  noticeDepartureGap:
    'The departure time you entered does not exist at this airport (clocks jump forward that night). It was moved to {time}.',
  noticeDepartureOverlap:
    'The departure time you entered occurs twice at this airport (clocks go back that night). The first occurrence is used.',
  noticeOpensGap:
    'The opening time falls in a daylight-saving gap at the airport and was moved forward.',
  noticeOpensOverlap:
    'The opening time occurs twice at the airport (clocks go back that night). The first occurrence is used.',
  departureLine: 'Departure: {when} · {zone}',
  departureLineUser: '{when} in your time zone',
  windowLine: 'Check-in window: {period} before departure',

  addToGoogle: 'Add to Google Calendar',
  downloadIcs: 'Download .ics',
  downloadIcsTitle: 'Calendar file for Apple Calendar, Outlook and other apps',
  copyLink: 'Copy link',
  linkCopied: 'Link copied',
  copyFailed: 'Copy failed. Copy the address bar instead.',

  calendarTitle: 'Online check-in opens · {iata}',
  calendarIntro:
    'Online check-in for your flight from {iata} ({airport}) opens {period} before departure.',
  calendarOpens: 'Check-in opens: {when} · {zone}',
  calendarOpensUser: 'In your time zone: {when} · {zone}',
  calendarDeparture: 'Departure: {when} · {zone}',
  calendarLink: 'Calculated with Check-in Calculator: {link}',
  calendarAlarm: 'Online check-in opens in 10 minutes',

  hoursCount: { one: '{n} hour', other: '{n} hours' },
  hoursAccusative: { one: '{n} hour', other: '{n} hours' },
  daysCount: { one: '{n} day', other: '{n} days' },
  daysAccusative: { one: '{n} day', other: '{n} days' },
  shortDays: '{n} d',
  shortHours: '{n} h',
  shortMinutes: '{n} min',
  lessThanMinute: 'less than a minute',

  footerPrivacy:
    'Everything is computed in your browser with its built-in time-zone database. No data leaves your device.',
  footerData: 'Airport data: OurAirports (public domain) and mwgg/Airports (MIT).',
  footerDataUpdated: 'Airport list updated: {date}',
  footerSource: 'Source code on GitHub',
};

/** @typedef {keyof typeof en} StringKey */

/** @type {Record<StringKey, StringValue>} */
const uk = {
  appTitle: 'Калькулятор реєстрації',
  appTagline: 'Дізнайтеся, коли саме відкриється онлайн-реєстрація на ваш рейс.',

  settingsButton: 'Налаштування',
  settingsTitle: 'Налаштування',
  settingsTheme: 'Тема',
  themeSystem: 'Як у системі',
  themeLight: 'Світла',
  themeDark: 'Темна',
  settingsLanguage: 'Мова',
  settingsClose: 'Готово',

  airportLabel: 'Аеропорт вильоту',
  airportPlaceholder: 'Код IATA, аеропорт або місто, напр. KBP',
  airportHint: 'Введіть трилітерний код IATA або почніть вводити назву аеропорту чи міста.',
  airportsLoading: 'Завантаження списку аеропортів…',
  airportNoResults: 'Немає аеропортів за запитом «{query}».',
  airportTimeZone: 'Часовий пояс: {zone}',
  dataError: 'Не вдалося завантажити список аеропортів. {error}',
  retry: 'Повторити',

  departureLabel: 'Запланований виліт',
  departureHint: 'Місцевий час аеропорту вильоту, як зазначено у квитку.',
  departureInvalid: 'Введіть коректні дату й час.',

  periodLabel: 'Реєстрація відкривається до вильоту за',
  tabHours: 'Години',
  tabDays: 'Дні',
  presetsLabel: 'Готові варіанти',
  presetHours: '{n} год',
  presetDays: { one: '{n} день', few: '{n} дні', many: '{n} днів', other: '{n} дня' },
  customLabel: 'Своє значення',
  customPlaceholder: 'напр. 20',
  unitHours: 'годин',
  unitDays: 'днів',
  periodErrorEmpty: 'Введіть число.',
  periodErrorNotInteger: 'Введіть ціле число.',
  periodErrorRange: 'Введіть число від {min} до {max}.',

  zoneLabel: 'Показувати час у поясі',
  zoneFollowAirport: 'Як в аеропорту',
  zoneFollowAirportWith: 'Як в аеропорту ({zone})',
  zoneUseDevice: 'Використати часовий пояс мого пристрою',
  zoneSelectLabel: 'Ваш часовий пояс',
  zoneGroupOther: 'Інше',

  resultPlaceholder:
    'Оберіть аеропорт, введіть час вильоту та період відкриття реєстрації, щоб побачити, коли вона відкриється.',
  resultTitle: 'Онлайн-реєстрація відкривається',
  airportTime: 'Час аеропорту · {zone}',
  yourTime: 'Ваш час · {zone}',
  localTime: 'Місцевий час у {iata} · {zone}',
  statusBefore: 'Відкриється через',
  statusOpen: 'Реєстрацію відкрито',
  statusOpenedAgo: 'відкрилася {ago} тому',
  statusDeparted: 'Цей рейс уже вилетів.',
  diffAhead: 'На момент відкриття реєстрації ваш часовий пояс випереджає аеропорт на {diff}.',
  diffBehind: 'На момент відкриття реєстрації ваш часовий пояс відстає від аеропорту на {diff}.',
  diffSame: 'На момент відкриття реєстрації ваш часовий пояс збігається з поясом аеропорту.',
  diffChanges:
    'Зверніть увагу: на момент вильоту різниця становитиме {diff}, бо між цими датами відбувається перехід на літній або зимовий час.',
  noticeDepartureGap:
    'Введеного часу вильоту в цьому аеропорту не існує (тієї ночі годинники переводять уперед). Його перенесено на {time}.',
  noticeDepartureOverlap:
    'Введений час вильоту трапляється в цьому аеропорту двічі (тієї ночі годинники переводять назад). Використано перший варіант.',
  noticeOpensGap:
    'Час відкриття припадає на пропущену під час переходу на літній час годину в аеропорту, тому його зсунуто вперед.',
  noticeOpensOverlap:
    'Час відкриття трапляється в аеропорту двічі (тієї ночі годинники переводять назад). Використано перший варіант.',
  departureLine: 'Виліт: {when} · {zone}',
  departureLineUser: '{when} у вашому часовому поясі',
  windowLine: 'Період реєстрації: за {period} до вильоту',

  addToGoogle: 'Додати в Google Календар',
  downloadIcs: 'Завантажити .ics',
  downloadIcsTitle: 'Файл календаря для Apple Calendar, Outlook та інших застосунків',
  copyLink: 'Копіювати посилання',
  linkCopied: 'Посилання скопійовано',
  copyFailed: 'Не вдалося скопіювати. Скопіюйте адресу з адресного рядка.',

  calendarTitle: 'Відкриття онлайн-реєстрації · {iata}',
  calendarIntro:
    'Онлайн-реєстрація на ваш рейс із {iata} ({airport}) відкривається за {period} до вильоту.',
  calendarOpens: 'Реєстрація відкривається: {when} · {zone}',
  calendarOpensUser: 'У вашому часовому поясі: {when} · {zone}',
  calendarDeparture: 'Виліт: {when} · {zone}',
  calendarLink: 'Розраховано за допомогою Калькулятора реєстрації: {link}',
  calendarAlarm: 'Онлайн-реєстрація відкриється за 10 хвилин',

  hoursCount: { one: '{n} година', few: '{n} години', many: '{n} годин', other: '{n} години' },
  hoursAccusative: { one: '{n} годину', few: '{n} години', many: '{n} годин', other: '{n} години' },
  daysCount: { one: '{n} день', few: '{n} дні', many: '{n} днів', other: '{n} дня' },
  daysAccusative: { one: '{n} день', few: '{n} дні', many: '{n} днів', other: '{n} дня' },
  shortDays: '{n} д',
  shortHours: '{n} год',
  shortMinutes: '{n} хв',
  lessThanMinute: 'менше хвилини',

  footerPrivacy:
    'Усі обчислення виконуються у вашому браузері за його вбудованою базою часових поясів. Жодні дані не покидають ваш пристрій.',
  footerData: 'Дані про аеропорти: OurAirports (суспільне надбання) та mwgg/Airports (MIT).',
  footerDataUpdated: 'Список аеропортів оновлено: {date}',
  footerSource: 'Вихідний код на GitHub',
};

/** @type {Record<StringKey, StringValue>} */
const de = {
  appTitle: 'Check-in-Rechner',
  appTagline: 'Finden Sie heraus, wann genau der Online-Check-in für Ihren Flug öffnet.',

  settingsButton: 'Einstellungen',
  settingsTitle: 'Einstellungen',
  settingsTheme: 'Design',
  themeSystem: 'Systemstandard',
  themeLight: 'Hell',
  themeDark: 'Dunkel',
  settingsLanguage: 'Sprache',
  settingsClose: 'Fertig',

  airportLabel: 'Abflughafen',
  airportPlaceholder: 'IATA-Code, Flughafen oder Stadt, z. B. FRA',
  airportHint:
    'Geben Sie den dreistelligen IATA-Code ein oder beginnen Sie, den Flughafen- oder Stadtnamen zu tippen.',
  airportsLoading: 'Flughafenliste wird geladen…',
  airportNoResults: 'Keine Flughäfen für „{query}“ gefunden.',
  airportTimeZone: 'Zeitzone: {zone}',
  dataError: 'Die Flughafenliste konnte nicht geladen werden. {error}',
  retry: 'Erneut versuchen',

  departureLabel: 'Planmäßiger Abflug',
  departureHint: 'Ortszeit am Abflughafen, wie auf Ihrem Ticket angegeben.',
  departureInvalid: 'Geben Sie ein gültiges Datum und eine gültige Uhrzeit ein.',

  periodLabel: 'Check-in öffnet vor Abflug',
  tabHours: 'Stunden',
  tabDays: 'Tage',
  presetsLabel: 'Voreinstellungen',
  presetHours: '{n} Std.',
  presetDays: { one: '{n} Tag', other: '{n} Tage' },
  customLabel: 'Eigener Wert',
  customPlaceholder: 'z. B. 20',
  unitHours: 'Stunden',
  unitDays: 'Tage',
  periodErrorEmpty: 'Geben Sie eine Zahl ein.',
  periodErrorNotInteger: 'Geben Sie eine ganze Zahl ein.',
  periodErrorRange: 'Geben Sie eine Zahl zwischen {min} und {max} ein.',

  zoneLabel: 'Zeiten anzeigen in',
  zoneFollowAirport: 'Wie am Flughafen',
  zoneFollowAirportWith: 'Wie am Flughafen ({zone})',
  zoneUseDevice: 'Zeitzone meines Geräts verwenden',
  zoneSelectLabel: 'Ihre Zeitzone',
  zoneGroupOther: 'Sonstige',

  resultPlaceholder:
    'Wählen Sie einen Flughafen, geben Sie die Abflugzeit ein und legen Sie das Check-in-Fenster fest, um zu sehen, wann der Check-in öffnet.',
  resultTitle: 'Online-Check-in öffnet',
  airportTime: 'Flughafenzeit · {zone}',
  yourTime: 'Ihre Zeit · {zone}',
  localTime: 'Ortszeit in {iata} · {zone}',
  statusBefore: 'Öffnet in',
  statusOpen: 'Check-in ist geöffnet',
  statusOpenedAgo: 'seit {ago} geöffnet',
  statusDeparted: 'Dieser Flug ist bereits abgeflogen.',
  diffAhead: 'Ihre Zeitzone ist dem Flughafen zum Zeitpunkt der Check-in-Öffnung {diff} voraus.',
  diffBehind: 'Ihre Zeitzone liegt zum Zeitpunkt der Check-in-Öffnung {diff} hinter dem Flughafen.',
  diffSame:
    'Ihre Zeitzone hat zum Zeitpunkt der Check-in-Öffnung denselben UTC-Versatz wie der Flughafen.',
  diffChanges:
    'Hinweis: Beim Abflug beträgt der Unterschied {diff}, weil dazwischen eine Zeitumstellung liegt.',
  noticeDepartureGap:
    'Die eingegebene Abflugzeit existiert an diesem Flughafen nicht (in dieser Nacht werden die Uhren vorgestellt). Sie wurde auf {time} verschoben.',
  noticeDepartureOverlap:
    'Die eingegebene Abflugzeit kommt an diesem Flughafen zweimal vor (in dieser Nacht werden die Uhren zurückgestellt). Es wird das erste Vorkommen verwendet.',
  noticeOpensGap:
    'Die Öffnungszeit fällt am Flughafen in die Lücke der Zeitumstellung und wurde nach vorn verschoben.',
  noticeOpensOverlap:
    'Die Öffnungszeit kommt am Flughafen zweimal vor (in dieser Nacht werden die Uhren zurückgestellt). Es wird das erste Vorkommen verwendet.',
  departureLine: 'Abflug: {when} · {zone}',
  departureLineUser: '{when} in Ihrer Zeitzone',
  windowLine: 'Check-in-Fenster: {period} vor Abflug',

  addToGoogle: 'Zu Google Kalender hinzufügen',
  downloadIcs: '.ics herunterladen',
  downloadIcsTitle: 'Kalenderdatei für Apple Kalender, Outlook und andere Apps',
  copyLink: 'Link kopieren',
  linkCopied: 'Link kopiert',
  copyFailed: 'Kopieren fehlgeschlagen. Kopieren Sie stattdessen die Adresszeile.',

  calendarTitle: 'Online-Check-in öffnet · {iata}',
  calendarIntro:
    'Der Online-Check-in für Ihren Flug ab {iata} ({airport}) öffnet {period} vor Abflug.',
  calendarOpens: 'Check-in öffnet: {when} · {zone}',
  calendarOpensUser: 'In Ihrer Zeitzone: {when} · {zone}',
  calendarDeparture: 'Abflug: {when} · {zone}',
  calendarLink: 'Berechnet mit dem Check-in-Rechner: {link}',
  calendarAlarm: 'Online-Check-in öffnet in 10 Minuten',

  hoursCount: { one: '{n} Stunde', other: '{n} Stunden' },
  hoursAccusative: { one: '{n} Stunde', other: '{n} Stunden' },
  daysCount: { one: '{n} Tag', other: '{n} Tage' },
  daysAccusative: { one: '{n} Tag', other: '{n} Tage' },
  shortDays: '{n} T',
  shortHours: '{n} Std.',
  shortMinutes: '{n} Min.',
  lessThanMinute: 'weniger als eine Minute',

  footerPrivacy:
    'Alles wird in Ihrem Browser mit dessen eingebauter Zeitzonendatenbank berechnet. Keine Daten verlassen Ihr Gerät.',
  footerData: 'Flughafendaten: OurAirports (gemeinfrei) und mwgg/Airports (MIT).',
  footerDataUpdated: 'Flughafenliste aktualisiert: {date}',
  footerSource: 'Quellcode auf GitHub',
};

/** @type {Record<LanguageCode, Record<StringKey, StringValue>>} */
const STRINGS = { en, uk, de };

/** Read-only view of every translation table, for tests and tooling. */
export const STRING_TABLES = /** @type {Readonly<typeof STRINGS>} */ (STRINGS);

/** @type {LanguageCode} */
let currentLanguage = DEFAULT_LANGUAGE;
let pluralRules = new Intl.PluralRules(DEFAULT_LANGUAGE);

/**
 * @param {unknown} code
 * @returns {code is LanguageCode}
 */
export function isLanguage(code) {
  return LANGUAGES.some((language) => language.code === code);
}

/** @returns {LanguageCode} */
export function getLanguage() {
  return currentLanguage;
}

/**
 * Switches the language used by `t()`. Components render text at mount time, so the
 * app re-mounts its UI after calling this.
 * @param {LanguageCode} code
 */
export function setLanguage(code) {
  if (!isLanguage(code)) throw new RangeError(`Unsupported language: ${code}`);
  currentLanguage = code;
  pluralRules = new Intl.PluralRules(code);
}

/**
 * BCP 47 locale associated with a language, for `Intl` date formatting.
 * @param {LanguageCode} code
 * @returns {string}
 */
export function languageLocale(code) {
  const language = LANGUAGES.find((entry) => entry.code === code);
  return language ? language.locale : 'en-GB';
}

/**
 * Looks up a string in the active language (falling back to English), selects the
 * plural form from `params.n` when applicable, and fills `{placeholders}`.
 * @param {StringKey} key
 * @param {Record<string, string | number>} [params]
 * @returns {string}
 */
export function t(key, params = {}) {
  const value = STRINGS[currentLanguage][key] ?? en[key];
  if (value === undefined) throw new Error(`Missing string: ${key}`);
  let template;
  if (typeof value === 'string') {
    template = value;
  } else {
    const category = pluralRules.select(Number(params.n));
    template = value[category] ?? value.other ?? Object.values(value)[0] ?? '';
  }
  return template.replace(/\{(\w+)\}/g, (match, name) =>
    name in params ? String(params[name]) : match,
  );
}
