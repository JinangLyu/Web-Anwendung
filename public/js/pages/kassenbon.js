import njk, { applyWhenDocumentLoaded } from '../../templating/njk.js';
import { pages } from "../shared.js";
import { fetchAllStores, fetchStoreDetails } from "../api/stores.js";
import { renderDataTemplatable } from "../../templating/head.js";
import { addItem, deleteItem, fetchDataForDateAndStore } from "../api/data.js";
import { autocomplete } from "../autocomplete.js";
import { fetchAllItems } from "../api/items.js";


const params = new URLSearchParams(window.location.search);
const mock = params.get('mock') === '1';

const ADD_ELEMENT = {
    name: "",
    price: 0.00,
    edit: false,
    item: null,
    uploaded: false,
};

const data = {
    title: 'Kassenbon',
    pages,
    params: {
        store: params.get('store'),
        date: params.get('date'),
        mock: mock,
    },
    store: !mock ? {
        label: null,
        id: null,
        edit: params.get('store') === null,
        select: [],
        details: null,
    } : {
        label: "Bluewater Braunschweig",
        id: "bluewater-bs-berliner-strasse",
        edit: false,
        select: [],
        details: {
            "name": "Bluewater Braunschweig",
            "description": "Bluewater_BS_DE_38104",
            "id": "bluewater-bs-berliner-strasse",
            "location": {
                "address": {
                    "contact": "0-800-800-800-70",
                    "street": "Berliner Str.",
                    "city": "Braunschweig",
                    "state": "Niedersachsen",
                    "zip": "38104",
                    "country": "DE",
                },
                "longitude": 10.5822001,
                "latitude": 52.2835007,
            },
            "company": "1878962598700",
        }
    },
    date: {
        date: Date.now(),
        edit: false,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    bon: !mock ? [ADD_ELEMENT] : [
        {
            name: "Apfel",
            price: 12.23,
            edit: false,
            item: null,
            uploaded: false,
        },
        {
            name: "Banane",
            price: 3.34,
            edit: false,
            item: null,
            uploaded: false,
        },
        ADD_ELEMENT,
    ],
    total: 0.00,
    items: !mock ? [] : [
        {
            name: "TELATE Apfelsaft [500 ML]",
            description: "TELATE Apfelsaft [500 ML] (Babynahrung und -pflege)",
            gtin: "1023690557719",
            product: "apfelsaft",
            quantity:{
                value: 500,
                unit: "MILLILITER",
            },
            producer: "6817566091199",
            image: "image/Bottle?label=orange&lid=pink&contents=yellow",
        }
    ],
};

if (!mock && data.params.store) {
    data.store.id = data.params.store;
    data.store.details = await fetchStoreDetails(data.params.store);
    data.store.label = data.store.details.name;
}
if (!mock && data.params.date) {
    data.date.date = new Date(data.params.date)
}

if (!mock && data.params.store && data.params.date) {
    applyWhenDocumentLoaded(async () => {
        const listData = await fetchDataForDateAndStore(data.params.store, data.params.date);
        console.log('listData', listData);
        data.bon = [
            ...listData.map((row) => ({
                name: row.item,
                price: row.price / 100,
                edit: false,
                item: row.item,
                uploaded: true,
            })),
            ADD_ELEMENT,
        ]
        update();
    })
}

applyWhenDocumentLoaded(update);


function update() {  // aka. reload, render, refresh
	const $e = document.querySelector('body');

    data.total = Math.round(data.bon.map((bon) => bon.price).reduce((curr, old) => curr+old, 0.00) * 100)/100;
    console.log('update:', data);
    window.data = data;

	njk.render('templates/pages/kassenbon.njk', data, (err, html) => {
        $e.innerHTML = err && err.message || html;
        console.log('editable fields:',document.querySelectorAll('.autocomplete input'))
        document.querySelectorAll('.autocomplete input').forEach((elem) => autocomplete(elem, api_item_autocomplete_callback, api_item_autocomplete_formatter));
    });

    renderDataTemplatable(data)
}


export function edit(index) {
    console.log('edit', index)
    // reset all to false
    for (const bonElement of data.bon) {
        bonElement.edit = false;
    }
    data.store.edit = false;
    data.date.edit = false;

    // set the correct one
    if (index === -1) {
        data.store.edit = true;
        return;
    }
    if (index === -2) {
        data.date.edit = true;
        return;
    }
    data.bon[index].edit = true;
}

function focus(index, isPrice) {
    console.log('focus', index, isPrice)
    let elem;
    if (index === -1) {
        elem = document.querySelector('.bon__title select');
    } else if (index === -2) {
        elem = document.querySelector('.bon__date input');
    } else {
        elem = document.querySelector(`input[data-index="${index}"][data-is-price="${isPrice}"]`);
    }
    elem?.focus();
}

/**
 * Changes the navigation url (without reloading, just for the browser history)
 *
 * If you come or go to the "new Bon" page, it does a new navigation step,
 * if you change values, it will edit the existing one.
 * @param date  Date
 * @param store  string
 */
function push_url(date, store) {
    const shouldPush = (
        (data.params.date === null && data.params.store === null)  // old url is stateless, i.e. "new Bon" page.
        ||
        (date === null && store === null)  // new url is stateless, i.e. "new Bon" page.
    )  // in that case we want to add a navigation step.

    data.params.date = new Date(date);
    data.params.store = store;

    const state = {
        ...data.params,
    }
    state.date = date.toISOString ? date.toISOString() : "" + date;

    console.log('push_url', {state, replace: !shouldPush});
    const title = `${document.title} - ${state.store} @ ${state.date}`

    const url = `${location.pathname}?${new URLSearchParams(state).toString()}`

    if (shouldPush) {
        window.history.pushState(state, title, url);
    } else {
        window.history.replaceState(state, title, url)
    }
}

/**
 * This will be called if you edit date or store of an existing Kassenbon.
 *
 * @param date  Date | undefined
 * @param store  string | undefined
 */
async function update_references(date = undefined, store = undefined) {
    if (typeof date === 'undefined') {
        date = data.params.date;
    }
    if (typeof store === 'undefined') {
        store = data.params.store;
    }
    if (data === data.params.state && store === data.params.store) {
        console.log('data is same, no need to update.')
        return;
    }

    await apiDeleteAll();
    push_url(date, store);
    await apiStoreAll();
}

async function api_remove_item(bonEntry) {
    await deleteItem(data.params.store, data.params.date, bonEntry.item)
    bonEntry.uploaded = false;
}

async function api_add_item(bonEntry) {
    await addItem(data.params.store, data.params.date, bonEntry.item, Math.round(bonEntry.price * 100), 1, false, false);
    bonEntry.uploaded = true;
}

async function api_edit_item(bonEntry) {
    if (bonEntry.uploaded) {
        await api_remove_item(bonEntry);
    }
    if (!bonEntry.uploaded) {
        await api_add_item(bonEntry);
    }
}

async function api_item_autocomplete_callback(query) {
    const lower = query.toLowerCase();
    return data.items.filter((item) =>
        item.name.toLowerCase().indexOf(lower) !== -1
        || item.description.toLowerCase().indexOf(lower) !== -1
        || item.gtin.toLowerCase().indexOf(lower) !== -1
        || item.product.toLowerCase().indexOf(lower) !== -1
    ).map((item) => [item.description, item.gtin]);
}

async function api_item_autocomplete_formatter(i, callbackData, query) {
    console.log('api_item_autocomplete_formatter', i, callbackData, query)
    const escape = (str) => (str || '').replace(/[\u00A0-\u9999<>&]/gim, function(i) {
        return '&#' + i.charCodeAt(0) + ';';
    })
    return `
        <span>${escape(callbackData[0])}</span>
        <input type='hidden' value=${JSON.stringify(escape(callbackData[1]))} />
    `;
    /*
    let text = "<strong>" + callbackData.name.slice(0, query.length) + "</strong>";
    text += callbackData.slice(query.length);
    // insert an input field that will hold the current array item's value:
    text += "<input type='hidden' value='" + callbackData + "'>";
    return text;

     */
}

async function apiDeleteAll() {
    for (const bonEntry of data.bon) {
        if (bonEntry.item && bonEntry.uploaded) {
            await api_remove_item(bonEntry);
        }
    }
}

async function apiStoreAll() {
    for (const bonEntry of data.bon) {
        if (bonEntry.item && !bonEntry.uploaded) {
            await api_add_item(bonEntry);
        }
    }
}


export function bonClick(index, isPrice) {
    edit(index);
    // noinspection EqualityComparisonWithCoercionJS
    update();
    focus(index, isPrice);
}


function bonInput(index, isPrice, elem) {
    const key = {false: "name", true: "price"}[isPrice];
    let value = elem.type === "number" ? Number.parseFloat(elem.value) :  elem.value;
    if (!isPrice) {
        const gtin = value;
        const lookup = data.items.filter((item) => item.gtin === gtin);
        if (lookup) {
            const details = lookup[0];
            console.log('bonInput.lookup', lookup)
            data.bon[index].name = details.name;
            data.bon[index].item = details.gtin;
        }
    }
    data.bon[index][key] = value;
    // update();  // disabled: this kills input focus
}

async function bonUnfocus(index, isPrice, elem) {
    console.log('bonUnfocus', index, isPrice, elem);
    if (!isPrice) return;

    const bonEntry = data.bon[index];
    if (bonEntry.item) {
        await api_edit_item(bonEntry);
    }
    const last = data.bon.length - 1;
    if (
        // index === data.bon.length - 1  && // is last row
        (data.bon[last].name !== '' || data.bon[last].price !== 0) // last row is not empty
    ) {
        data.bon.push({
            name: "",
            price: 0.00,
            edit: true,
            item: null,
            uploaded: false,
        })
        edit(last + 1);
        update();
        focus(last, false);
    }
}

async function bonSubmit(index) {
    const item = data.bon[index];
    const bonEntry = data.bon[index];
    console.log('bonSubmit.bonEntry', bonEntry);
    if(bonEntry.item) {
        await api_edit_item(item);
    }
    replaceGtinWithName();
    update();
}

async function bonDelete(index) {
    const deleted = data.bon.splice(index, 1)[0];
    await deleteItem(data.params.store, data.params.date, deleted.item);
    update();
}

async function storeChange(elem) {
    console.log('changeStore', elem)
    const id = elem.selectedOptions[0].value;
    const selectedStore = data.store.select.find((s) => s.id === id)
    data.store.label = selectedStore.name;
    data.store.id = selectedStore.id;
    data.store.edit = false;
    data.store.details = await fetchStoreDetails(selectedStore.id)
    await update_references(undefined, id);
    update();
}

function dateInput(elem) {
    const value = new Date(elem.value);
    data.date.date = value;
}

async function dateUnfocus(elem) {
    data.date.edit = false;
    await update_references(data.date.date, undefined);
    update();
}


window.bonClick = bonClick;
window.bonInput = bonInput;
window.bonUnfocus = bonUnfocus;
window.bonDelete = bonDelete;
window.bonSubmit = bonSubmit;
window.storeChange = storeChange;
window.dateInput = dateInput;
window.dateUnfocus = dateUnfocus;


data.store.select = await fetchAllStores();
applyWhenDocumentLoaded(update);
data.items = await fetchAllItems();

function replaceGtinWithName() {
    data.item_map = Object.fromEntries(data.items.map(item => ([""+item.gtin, item])));
    for (let bonItem of data.bon) {
        if (bonItem.name in data.item_map) {
            const details = data.item_map[bonItem.name];
            bonItem.name = details.name;
            bonItem.item = details.gtin;
        }
    }
}

replaceGtinWithName();
update();

