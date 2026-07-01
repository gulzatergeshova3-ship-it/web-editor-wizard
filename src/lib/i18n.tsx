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

interface I18nCtx { lang: Lang; setLang: (l: Lang) => void; tr: (k: string) => string; }

const I18nContext = createContext<I18nCtx>({ lang: "ru", setLang: () => {}, tr: (k) => k });

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Lang | null) : null;
    if (saved && ["ru", "en", "kg"].includes(saved)) setLangState(saved);
  }, []);
  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };
  const tr = (k: string) => t[k]?.[lang] ?? k;
  return <I18nContext.Provider value={{ lang, setLang, tr }}>{children}</I18nContext.Provider>;
}

export function useI18n() { return useContext(I18nContext); }

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
