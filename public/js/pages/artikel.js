import njk, { applyWhenDocumentLoaded } from '../../templating/njk.js';
import { pages, itemsPerPage } from "../shared.js";
import { renderDataTemplatable } from "../../templating/head.js";
import { fetchAllItems } from "../api/items.js";
import { calculatePagination } from "../pagination.js";
import { fetchDataForGtins } from "../api/data.js";
import { highestPrice } from "../price.js";



const params = new URLSearchParams(window.location.search);
const mock = params.get('mock') === '1';

const data = {
    location: window.location,
    title: 'Artikel',
    pages,
    pagination: !mock ? [] : [
        {
            page: 1,
            isEllipsis: false,
            isActive: true,
        },
        {
            isEllipsis: true,
            isActive: false,
        },
        {
            page: 9,
            isEllipsis: false,
            isActive: false,
        },
    ],
    params: {
        mock: mock,
    },
    _items: [],  // from the api, without nice_description
    items: !mock ? [] : [
        {
            "name":"TELATE Apfelsaft [500 ML]","description":"TELATE Apfelsaft [500 ML] (Babynahrung und -pflege)","gtin":"1023690557719","product":"apfelsaft","quantity":{"value":500,"unit":"MILLILITER"},"producer":"6817566091199","image":"image/Bottle?label=orange&lid=pink&contents=yellow",
            nice_description: "(Babynahrung und -pflege)"
        }
    ],
    _filtered_items: [], // .items, but with .search
    _prices: [], // {gtin: '…', data: {}} version of .prices
    prices: {},  // ._prices but only data, and gtin is the key.
    search: "",
    paginated_items: [], // ._filtered_items, but with .currentPage & .itemsPerPage
    itemsPerPage,
    totalPages: 0,
    currentPage: 0,
};

applyWhenDocumentLoaded(update, true);

window.data = data;


async function update(fast = false) {  // aka. reload, render, refresh
    console.log('update', {fast})
    const $e = document.querySelector('body');

    filterSearch();
    if (!fast) {
        await loadMissingPrices()
    }

    console.log('update:', data);
    window.data = data;

    njk.render('templates/pages/artikel.njk', data, (err, html) => {
        $e.innerHTML = err && err.message || html;
    });

    renderDataTemplatable(data)
}

data._items = await fetchAllItems();
data.items = data._items
    .map((item) => {
        item.nice_description = (item.description.startsWith(item.name) ? item.description.slice(item.name.length) : item.description).trim().replace(/^\(|\)$/g, '');
        return item;
    })
await update(true);

async function aaaaa() {
    await update(true);
    await loadMissingPrices();
    await update(false);
}

requestAnimationFrame(aaaaa)

async function loadMissingPrices() {
    const gtinsToLoad = [];
    for (const gtin of data.paginated_items.map((item) => item.gtin)) {
        if (gtin in data.prices) {
            continue;
        }
        gtinsToLoad.push(gtin)
    }
    console.log({gtinsToLoad})
    const results = await fetchDataForGtins(data._items.map((item) => item.gtin))
    window.gtinsToLoad = gtinsToLoad;
    window.fetchDataForGtins = fetchDataForGtins;
    for (const result of results) {
        data.prices[result?.value?.gtin] = highestPrice(result?.value?.data)
    }
}

function filterSearch() {
    const search = data.search.trim().toLowerCase();
    data._filtered_items = data.items.filter((item) => {
        return search === ""
        ||
        item.gtin.toLowerCase().indexOf(search) !== -1
        ||
        item.name.toLowerCase().indexOf(search) !== -1
        ||
        item.description.toLowerCase().indexOf(search) !== -1
        ||
        item.product.toLowerCase().indexOf(search) !== -1
        ||
        item.image.toLowerCase().indexOf(search) !== -1   // this one gives us 'color tags' like yellow
    });
    data.totalPages = Math.ceil(data._filtered_items.length / data.itemsPerPage);
    if (data.totalPages <= data.currentPage) {
        data.currentPage = data.totalPages - 1;
    }
    if (data.currentPage < 0) {
        data.currentPage = 0;
    }
    data.paginated_items = data._filtered_items.slice(data.itemsPerPage * data.currentPage, data.itemsPerPage * (data.currentPage + 1));
    data.pagination = calculatePagination(data.totalPages, data.currentPage);
}

function filterOnInput(query) {
    console.log('filterOnInput', {query})
    data.currentPage = 0;
    data.search = query;
    aaaaa();
}


function gotoPage(page) {
    if (typeof page === "boolean") {
        if (page) {
            data.currentPage++;
        } else {
            data.currentPage--;
        }
    } else {
        data.currentPage = page - 1;  // it's human-indexed, not 0-indexed.
    }
    aaaaa();
}

window.gotoPage = gotoPage;
window.filterOnInput = filterOnInput;


