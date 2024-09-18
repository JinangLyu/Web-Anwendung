import njk, { applyWhenDocumentLoaded } from '../../templating/njk.js';
import { pages } from "../shared.js";
import { renderDataTemplatable } from "../../templating/head.js";
import { fetchAllUsersData, deleteItem } from "../api/data.js"
import { fetchAllStores } from "../api/stores.js";
import { fetchAllItems } from "../api/items.js";


const params = new URLSearchParams(window.location.search);
const mock = params.get('mock') === '1';

const data = {
    location: window.location,
    title: 'Kassenbons',
    pages,
    params: {
        mock: mock,
    },
    bon_entries: !mock ? [] : [{
        "time": "1970-01-01T00:00:00Z",
        "store": "bluewater-bs-berliner-strasse",
        "item": "1060252485135",
        "number": 1,
        "price": 0,
        "special": false,
        "soldOut": false
    }],
};

applyWhenDocumentLoaded(update);

window.data = data;

data.stores = await fetchAllStores();
data.items = await fetchAllItems();

data.store_map =  data.stores.reduce((r, storeEntry) => {
    console.log("stores.reduce.storeEntry", storeEntry, r);
    const { id } = storeEntry;
    r[id] = storeEntry;
    return r
}, {});

data.item_map =  data.items.reduce((r, itemEntry) => {
    console.log("items.reduce.itemEntry", itemEntry);
    const { gtin } = itemEntry;
    r[gtin] = itemEntry;
    return r
}, {});

async function loadData() {
    data.bon_entries = await fetchAllUsersData();

    console.log('data.bons', data.bons);

    data.bons = data.bon_entries.reduce((r, bonEntry) => {
        const {time, store, ...rest} = bonEntry;
        if (! (store in r)) {
            r[store] = {
                details: data.store_map[store],
                dates: {}
            };
        }
        if (! (time in r[store].dates)) {
            r[store].dates[time] = {
                details:data.item_map[bonEntry.item],
                entries: [],
                total: 0,
            };
        }

        r[store].dates[time].entries.push({item: bonEntry, details: data.item_map[bonEntry.item] || null,});
        r[store].dates[time].total += bonEntry.price * bonEntry.number;
        return r;
    }, {});

    update();
}

await loadData();


function update() {  // aka. reload, render, refresh
    const $e = document.querySelector('body');

    console.log('update:', data);
    window.data = data;

    njk.render('templates/pages/kassenbons.njk', data, (err, html) => {
        $e.innerHTML = err && err.message || html;
    });

    renderDataTemplatable(data)
}


async function trash(store, time) {
    const ddos = [];
    for (const entry of data.bons[store].dates[time].entries) {
        ddos.push(deleteItem(store, time, entry.item.item));
    }
    await Promise.allSettled(ddos);
    await loadData();
}


window.trash = trash;