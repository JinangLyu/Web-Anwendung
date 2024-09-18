import { paginatedRequest } from "./shared.js";

export async function fetchAllProducts() {
    console.log('fetchAllProducts');
    return await paginatedRequest('product/find', { name: '%' },)
}
