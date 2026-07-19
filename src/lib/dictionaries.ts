export const locales = ["es", "ca"] as const;
export type Locale = (typeof locales)[number];

const dictionaries = {
  es: {
    announcement: "Env\u00edo gratuito a partir de 60 EUR",
    nav: ["Novedades", "Colecciones", "Esenciales", "Nuestra historia"],
    search: "Buscar", account: "Cuenta", cart: "Cesta",
    eyebrow: "Colecci\u00f3n de temporada",
    title: "Objetos con criterio para vivir mejor.",
    intro: "Una selecci\u00f3n serena de piezas \u00fatiles, duraderas y honestas. Dise\u00f1ada como base para comercios con identidad propia.",
    cta: "Descubrir la colecci\u00f3n", secondary: "Conocer la marca",
    categoriesTitle: "Compra por categor\u00eda", productsTitle: "Una selecci\u00f3n esencial",
    viewAll: "Ver todos los productos",
    values: ["Env\u00edos trazables", "Pago seguro", "Atenci\u00f3n cercana"],
    newsletter: "Ideas, novedades y piezas que merecen quedarse.",
    email: "Tu correo electr\u00f3nico", subscribe: "Suscribirme",
    footer: ["Ayuda", "Env\u00edos y devoluciones", "Privacidad", "Condiciones"],
  },
  ca: {
    announcement: "Enviament gratu\u00eft a partir de 60 EUR",
    nav: ["Novetats", "Col\u00b7leccions", "Essencials", "La nostra hist\u00f2ria"],
    search: "Cercar", account: "Compte", cart: "Cistella",
    eyebrow: "Col\u00b7lecci\u00f3 de temporada",
    title: "Objectes amb criteri per viure millor.",
    intro: "Una selecci\u00f3 serena de peces \u00fatils, duradores i honestes. Dissenyada com a base per a comer\u00e7os amb identitat pr\u00f2pia.",
    cta: "Descobrir la col\u00b7lecci\u00f3", secondary: "Con\u00e8ixer la marca",
    categoriesTitle: "Compra per categoria", productsTitle: "Una selecci\u00f3 essencial",
    viewAll: "Veure tots els productes",
    values: ["Enviaments tra\u00e7ables", "Pagament segur", "Atenci\u00f3 propera"],
    newsletter: "Idees, novetats i peces que mereixen quedar-se.",
    email: "El teu correu electr\u00f2nic", subscribe: "Subscriure-m'hi",
    footer: ["Ajuda", "Enviaments i devolucions", "Privacitat", "Condicions"],
  },
};

export function getDictionary(locale: Locale) { return dictionaries[locale]; }
