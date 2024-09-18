if (localStorage.getItem('apikey') === null) {
    localStorage.setItem('apikey', prompt('API KEY PLZ'));
}

export const pages = [
    { name: "Startseite", link: "/startseite.html" },
    { name: "Geschäfte", link: "/geschaefte.html" },
    { name: "Produkte", link: "/produkte.html" },
    { name: "Artikel", link: "/artikel.html" },
    { name: "Unternehmen", link: "/unternehmen.html" },
    { name: "Kassenbons", link: "/kassenbons.html" },
];

export const itemsPerPage = 12;
