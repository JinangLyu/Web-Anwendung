import { paginatedRequest, simpleRequest } from "./shared.js";

export async function fetchAllUsersData() {
    console.log('fetchAllUsersData');

    return await paginatedRequest(
        'data',
        {},
    );
}


/**
 * @param storeId
 * @param dateTime str | Date
 * @returns {Promise<*[]>}
 */
export async function fetchDataForDateAndStore(storeId, dateTime) {
    console.log('fetchDataForDateAndStore');

    return await paginatedRequest(
        'data',
        {
            store: storeId,
            time: dateTime instanceof Date ? dateTime.toISOString() : (typeof dateTime  === 'string' ? dateTime : dateTime.toString()),
        },
    );
}


/**
 * Fetch data entries for a single product.
 * @param gtin  {string}
 * @param from_date  {string|undefined}
 * @param to_date  {string|undefined}
 * @param stores_array  {string[]|undefined}
 * @returns {Promise<*[]>}
 */
export async function fetchDataForGtin(
    gtin,
    from_date = undefined,
    to_date = undefined,
    stores_array = undefined,
) {
    console.log('fetchDataForGtin', {gtin, from_date, to_date, stores_array});

    const queryData = {};
    if (from_date !== undefined) {
        queryData.from = from_date;
    }
    if (to_date !== undefined) {
        queryData.to = to_date;
    }
    if (stores_array !== undefined) {
        queryData.stores = stores_array;
    }

    return await paginatedRequest(
        `data/item/${gtin}`,
        queryData,
    );
}


/**
 * Fetch data entries for a single product.
 * @param gtins  {string[]}
 * @param from_date  {string|undefined}
 * @param to_date  {string|undefined}
 * @param stores_array  {string[]|undefined}
 * @returns {Promise<*[]>}
 */
export async function fetchDataForGtins(
    gtins,
    from_date = undefined,
    to_date = undefined,
    stores_array = undefined,
){
    const apiDDoS = [];
    for (const gtin of gtins) {
        apiDDoS.push((async () => ({gtin, data: await fetchDataForGtin(gtin, from_date, to_date, stores_array)}))());
    }
    return await Promise.allSettled(apiDDoS);
}


/**
 * @param storeId
 * @param dateTime str | Date
 * @param price number
 * @returns {Promise<*[]>}
 */
export async function addItem(
    storeId,
    dateTime,
    item,
    price,
    number = 1,
    special = false,
    soldOut = false,
) {
    console.log('addItem');

    return await simpleRequest(
        'data',
        undefined,
        {},
        {
            store: storeId,
            time: dateTime instanceof Date ? dateTime.toISOString() : (typeof dateTime === 'string' ? dateTime : dateTime.toString()),
            item: item,
            number: number,
            price: price,
            special: special,
            soldOut: soldOut,
        },
        {
            method: 'POST',
        },
        false,
    );
}


/**
 * @param storeId
 * @param dateTime str | Date
 * @returns {Promise<*[]>}
 */
export async function deleteItem(storeId, dateTime, item) {
    console.log('deleteItem');

    return await simpleRequest(
        'data',
        {
            store: storeId,
            time: dateTime instanceof Date ? dateTime.toISOString() : (typeof dateTime  === 'string' ? dateTime : dateTime.toString()),
            item: item,
        },
        {},
        undefined,
        {
            method: 'DELETE',
        },
        false,
    );
}
