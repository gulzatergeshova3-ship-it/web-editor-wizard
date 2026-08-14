import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

export type Lang = "ru" | "en" | "kg";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "kg", label: "KG" },
];

type Dict = Record<string, Record<Lang, string>>;

export const t: Dict = {
  nav_about: { ru: "О конференции", en: "About", kg: "Биз жөнүндө" },
  nav_sections: { ru: "Направления", en: "Tracks", kg: "Багыттар" },
  nav_program: { ru: "Программа", en: "Program", kg: "Программа" },
  nav_speakers: { ru: "Спикеры", en: "Speakers", kg: "Спикерлер" },
  nav_articles: { ru: "Статьи и доклады", en: "Papers & talks", kg: "Макалалар жана баяндамалар" },
  nav_partners: { ru: "Партнёры", en: "Partners", kg: "Өнөктөштөр" },
  nav_contacts: { ru: "Контакты", en: "Contacts", kg: "Байланыш" },
  register: { ru: "Регистрация", en: "Register", kg: "Катталуу" },
  register_long: { ru: "Зарегистрироваться", en: "Register now", kg: "Катталуу" },
  download_program: { ru: "Скачать программу", en: "Download program", kg: "Программаны жүктөө" },
  event_date_label: { ru: "Дата проведения", en: "Event date", kg: "Өткөрүү күнү" },
  location_label: { ru: "Локация", en: "Location", kg: "Жайгашуу" },
  countdown_title: { ru: "До начала конференции осталось", en: "Time until conference", kg: "Конференцияга чейин калды" },
  days: { ru: "дней", en: "days", kg: "күн" },
  hours: { ru: "часов", en: "hours", kg: "саат" },
  minutes: { ru: "минут", en: "minutes", kg: "мүнөт" },
  seconds: { ru: "секунд", en: "seconds", kg: "секунд" },
  sections_title: { ru: "Научные направления", en: "Scientific tracks", kg: "Илимий багыттар" },
  sections_subtitle: { ru: "Конференция включает ключевые секции современной науки и практики.", en: "Key tracks covering modern science and practice.", kg: "Заманбап илимдин жана практиканын негизги багыттары." },
  speakers_title: { ru: "Спикеры", en: "Speakers", kg: "Спикерлер" },
  articles_title: { ru: "Научные статьи и доклады", en: "Scientific papers & talks", kg: "Илимий макалалар жана баяндамалар" },
  program_title: { ru: "Программа", en: "Program", kg: "Программа" },
  partners_title: { ru: "Партнёры", en: "Partners", kg: "Өнөктөштөр" },
  contacts_title: { ru: "Контакты", en: "Contacts", kg: "Байланыш" },
  reg_full_name: { ru: "ФИО", en: "Full name", kg: "Толук аты-жөнү" },
  reg_email: { ru: "Email", en: "Email", kg: "Email" },
  reg_phone: { ru: "Телефон", en: "Phone", kg: "Телефон" },
  reg_org: { ru: "Организация / Компания", en: "Organization / Company", kg: "Уюм / Компания" },
  reg_position: { ru: "Должность", en: "Position", kg: "Кызматы" },
  reg_country: { ru: "Страна", en: "Country", kg: "Өлкө" },
  reg_section: { ru: "Интересующая секция", en: "Track of interest", kg: "Кызыктуу багыт" },
  reg_message: { ru: "Комментарий", en: "Message", kg: "Комментарий" },
  reg_consent: {
    ru: "Я согласен(на) с обработкой персональных данных.",
    en: "I agree to the processing of my personal data.",
    kg: "Жеке маалыматтарды иштетүүгө макулмун.",
  },
  reg_submit: { ru: "Зарегистрироваться", en: "Register", kg: "Катталуу" },
  reg_success_title: { ru: "Спасибо за регистрацию!", en: "Thank you for registering!", kg: "Катталууңуз үчүн рахмат!" },
  reg_success_msg: {
    ru: "Сохраните ваш персональный QR-код. Он будет использоваться для регистрации участников при входе в день конференции.",
    en: "Please save your personal QR code. It will be used for registration at the entrance on the day of the conference.",
    kg: "Өзүңүздүн жеке QR-кодуңузду сактап коюңуз. Ал конференция күнү кире бериште катышуучуларды каттоо үчүн колдонулат.",
  },
  reg_your_id: { ru: "Ваш регистрационный ID", en: "Your registration ID", kg: "Каттоо ID" },
  reg_download_qr: { ru: "Скачать QR-код", en: "Download QR code", kg: "QR-кодду жүктөө" },
  reg_dialog_title: { ru: "Регистрация на конференцию", en: "Conference registration", kg: "Конференцияга катталуу" },
  admin: { ru: "Кабинет админа", en: "Admin", kg: "Админ" },
  login: { ru: "Войти", en: "Sign in", kg: "Кирүү" },
  logout: { ru: "Выйти", en: "Sign out", kg: "Чыгуу" },
  password: { ru: "Пароль", en: "Password", kg: "Сырсөз" },
  sign_in: { ru: "Войти в кабинет", en: "Sign in", kg: "Кирүү" },
  sign_up: { ru: "Создать аккаунт", en: "Sign up", kg: "Каттоо" },
  view_site: { ru: "Перейти на сайт", en: "View site", kg: "Сайтка өтүү" },
  save: { ru: "Сохранить", en: "Save", kg: "Сактоо" },
  delete: { ru: "Удалить", en: "Delete", kg: "Өчүрүү" },
  add: { ru: "Добавить", en: "Add", kg: "Кошуу" },
  quick_links: { ru: "Конференция", en: "Conference", kg: "Конференция" },
  organizers: { ru: "Организаторы", en: "Organizers", kg: "Уюштуруучулар" },

};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  tr: (k: string) => string;
  /** Localized value with automatic machine translation fallback */
  L: (value: unknown) => string;
  LA: (value: unknown) => string[];
}

const I18nContext = createContext<I18nCtx>({
  lang: "ru",
  setLang: () => {},
  tr: (k) => k,
  L: (v) => pickL(v, "ru"),
  LA: (v) => pickLArray(v, "ru"),
});

const STORE_KEY = "auto_tr_v1";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  const [cache, setCache] = useState<Record<string, string>>({});
  const pending = useRef<Record<"en" | "kg", Set<string>>>({ en: new Set(), kg: new Set() });
  const asked = useRef<Set<string>>(new Set());
  const timers = useRef<Record<"en" | "kg", ReturnType<typeof setTimeout> | null>>({ en: null, kg: null });

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (saved && ["ru", "en", "kg"].includes(saved)) setLangState(saved);
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) setCache(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  useEffect(() => {
    document.documentElement.lang = lang === "kg" ? "ky" : lang;
  }, [lang]);

  const flush = useCallback(async (target: "en" | "kg") => {
    const texts = Array.from(pending.current[target]);
    pending.current[target].clear();
    if (!texts.length) return;
    try {
      const { translateTexts } = await import("@/lib/translate.functions");
      const chunks: string[][] = [];
      for (let i = 0; i < texts.length; i += 10) chunks.push(texts.slice(i, i + 10));

      const runChunk = async (chunk: string[]) => {
        try {
          const res = await translateTexts({ data: { lang: target, texts: chunk } });
          const add: Record<string, string> = {};
          for (const [src, out] of Object.entries(res ?? {})) add[`${target}|${src}`] = out as string;
          if (Object.keys(add).length) {
            setCache((c) => {
              const next = { ...c, ...add };
              try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
              return next;
            });
          }
          // any string the model skipped can be retried later
          for (const s of chunk) if (!(s in (res ?? {}))) asked.current.delete(`${target}|${s}`);
        } catch (e) {
          console.error("Translation chunk failed", e);
          for (const s of chunk) asked.current.delete(`${target}|${s}`);
        }
      };

      // run up to 4 chunks in parallel
      const queueCopy = [...chunks];
      const workers = Array.from({ length: Math.min(4, queueCopy.length) }, async () => {
        for (;;) {
          const chunk = queueCopy.shift();
          if (!chunk) return;
          await runChunk(chunk);
        }
      });
      await Promise.all(workers);
    } catch (e) {
      console.error("Translation failed", e);
    }
  }, []);


  const queue = (text: string, target: Lang) => {
    if (typeof window === "undefined" || target === "ru") return;
    const key = `${target}|${text}`;
    if (asked.current.has(key)) return;
    asked.current.add(key);
    pending.current[target].add(text);
    if (timers.current[target]) clearTimeout(timers.current[target]);
    timers.current[target] = setTimeout(() => flush(target as "en" | "kg"), 400);
  };


  const auto = (base: string): string => {
    if (!base || lang === "ru") return base;
    const hit = cache[`${lang}|${base}`];
    if (hit) return hit;
    queue(base, lang);
    return base;
  };

  const L = (value: unknown): string => {
    if (!value) return "";
    if (typeof value === "string") return auto(value);
    if (typeof value === "object") {
      const v = value as Record<string, string>;
      const own = v[lang];
      if (own && own.trim()) return own;
      const base = v.ru || v.en || Object.values(v).find((x) => typeof x === "string" && x.trim()) || "";
      return auto(base);
    }
    return String(value);
  };

  const LA = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.map((x) => auto(String(x)));
    if (!value || typeof value !== "object") return [];
    const v = value as Record<string, string[]>;
    const own = v[lang];
    if (own && own.length) return own;
    return (v.ru || v.en || []).map((x) => auto(x));
  };

  const tr = (k: string) => t[k]?.[lang] ?? k;
  return <I18nContext.Provider value={{ lang, setLang, tr, L, LA }}>{children}</I18nContext.Provider>;
}


export function pickL(value: unknown, lang: Lang): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const v = value as Record<string, string>;
    return v[lang] || v.ru || v.en || Object.values(v)[0] || "";
  }
  return String(value);
}

export function pickLArray(value: unknown, lang: Lang): string[] {
  if (!value || typeof value !== "object") return [];
  const v = value as Record<string, string[]>;
  return v[lang] || v.ru || v.en || [];
}

export function useI18n() { return useContext(I18nContext); }
