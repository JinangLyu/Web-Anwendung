export async function simpleRequest(
    endpoint,
    queryData = undefined,
    headers = {},
    json = undefined,
    fetchParams = {},
    parseJson = true,
    accessor = (data) => data,
) {
    console.log('simpleRequest', endpoint, queryData, {headers, fetchParams, accessor});

    const query = queryData === undefined ? '' : `?${new URLSearchParams(queryData)}`;
    const apiUrl = `http://trawl-fki.ostfalia.de/api/${endpoint}${query}`;
    console.log('url', apiUrl)

    const response = await fetch(
        apiUrl,
        {
            headers: {
                'Accept': 'application/json',
                'X-API-KEY': localStorage.getItem('apikey'),
                ...(json === undefined ? {} : {"Content-Type": "application/json"}),
                ...headers,
            },
            ...(json === undefined ? {} : {body: JSON.stringify(json, null, 2)}),
            ...fetchParams,
        },
    );

    if (!response.ok) {
        const err = new Error(`Network response was not ok: ${response}`);
        err.response = response;
    }

    let rData;
    if (parseJson) {
         rData = await response.json();
    } else {
        rData = await response.text();
    }
    console.log('rData', rData);

    return accessor(rData);
}

export async function paginatedRequest(
    endpoint,
    queryData,
    headers = {},
    fetchParams = {},
    accessor = (data) => data.content,
) {
    console.log('paginatedRequest', endpoint, queryData, {headers, fetchParams, accessor});
    const returnData = [];
    if (!queryData.size) {
        queryData.size = 999;
    }

    async function fetchNextPage(page) {
        console.log('fetchNextPage', page);

        const aData = await simpleRequest(
            endpoint,
            Object.assign({}, queryData, {page: page}),
            headers,
            undefined,
            fetchParams,
            true,
            accessor,
        )

        for (const contentElement of aData) {
            returnData.push(contentElement);
        }

        if (aData.length !== 0) {
            console.log('fetchNextPage >>>', 'can fetch another page.');
            await fetchNextPage(page + 1);
        }
    }

    await fetchNextPage(0);
    console.log('returnData', returnData)
    return returnData;
}
