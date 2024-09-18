import { paginatedRequest } from "./shared.js";

export async function fetchAllStores() {
    console.log('fetchAllStores');
    return await paginatedRequest('store/find', { name: '%' },)
}


export async function fetchStoreDetails(storeId) {
    const apiUrl = `http://trawl-fki.ostfalia.de/api/store/${storeId}`;

    let response;
    try {
        response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'X-API-KEY': localStorage.getItem('apikey')
            }
        })

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
    } catch (e) {
        console.error('There was a problem with the fetch operation:', error);
        return
    }

    const data = await response.json();

    console.log('fetchStoreDetails', data)

    return data;
}