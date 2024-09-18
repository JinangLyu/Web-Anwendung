import njk, { applyWhenDocumentLoaded } from '../../templating/njk.js';
import { pages } from "../shared.js";
import { renderDataTemplatable } from "../../templating/head.js";
import { fetchItem } from "../api/items.js";



const params = new URLSearchParams(window.location.search);
const mock = params.get('mock') === '1';

const data = {
    location: window.location,
    title: 'Artikel',
    pages,
    params: {
        mock: mock,
        id: params.get('id'),
    },
    item: !mock ? null :
    {
        "name":"TELATE Apfelsaft [500 ML]","description":"TELATE Apfelsaft [500 ML] (Babynahrung und -pflege)","gtin":"1023690557719","product":"apfelsaft","quantity":{"value":500,"unit":"MILLILITER"},"producer":"6817566091199","image":"image/Bottle?label=orange&lid=pink&contents=yellow",
        nice_description: "(Babynahrung und -pflege)"
    },
    prices: [],  // ._prices but only data, and gtin is the key.
};

applyWhenDocumentLoaded(update, true);

window.data = data;

data.item = await fetchItem(data.params.id);
update();

function update() {  // aka. reload, render, refresh
    const $e = document.querySelector('body');

    console.log('update:', data);
    window.data = data;

    njk.render('templates/pages/artikel-details.njk', data, (err, html) => {
        $e.innerHTML = err && err.message || html;
    });

    renderDataTemplatable(data)
}
