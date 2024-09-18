import { paginatedRequest, simpleRequest } from "./shared.js";

export async function fetchAllItems() {
    console.log('fetchAllItems');
    return await paginatedRequest('item/find', { name: '%' },)
}


export async function fetchItem(itemId) {
    return await simpleRequest(`item/${itemId}`,
        {},
    )
}
