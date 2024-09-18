import { getSelector } from "../js/selector.js";
import env from "./njk.js";

export function renderIntoElement(elem, data, selector = undefined) {
    if (selector === undefined) {
        selector = getSelector(elem);
    }
    if (!window.template_cache) {
        window.template_cache = {}
    }
    if (!window.template_cache[selector]) {
        window.template_cache[selector] = elem.innerHTML
    }

    elem.innerHTML = env.renderString(window.template_cache[selector], data)
}

export function renderDataTemplatable(data) {
    document.querySelectorAll('[data-templatable]').forEach(
        (elem) => renderIntoElement(elem, data)
    );
}
