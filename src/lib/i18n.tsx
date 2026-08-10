import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
    ru: "На ваш email отправлено письмо с подтверждением и персональным QR-кодом. Пожалуйста, сохраните QR-код — он понадобится для входа на конференцию.",
    en: "A confirmation email with your personal QR code has been sent. Please keep the QR code — you will need it to enter the conference.",
    kg: "Электрондук почтаңызга ырастоо каты жана жеке QR-кодуңуз жөнөтүлдү. QR-кодду сактап коюңуз — ал конференцияга кирүү үчүн керек болот.",
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
  const pending = useRef<Set<string>>(new Set());
  const asked = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const flush = async (target: Lang) => {
    const texts = Array.from(pending.current);
    pending.current.clear();
    if (!texts.length || target === "ru") return;
    try {
      const { translateTexts } = await import("@/lib/translate.functions");
      const res = await translateTexts({ data: { lang: target as "en" | "kg", texts } });
      const add: Record<string, string> = {};
      for (const [src, out] of Object.entries(res ?? {})) add[`${target}|${src}`] = out as string;
      if (Object.keys(add).length) {
        setCache((c) => {
          const next = { ...c, ...add };
          try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
          return next;
        });
      }
    } catch { /* ignore */ }
  };

  const queue = (text: string, target: Lang) => {
    if (typeof window === "undefined") return;
    const key = `${target}|${text}`;
    if (asked.current.has(key)) return;
    asked.current.add(key);
    pending.current.add(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => flush(target), 200);
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
