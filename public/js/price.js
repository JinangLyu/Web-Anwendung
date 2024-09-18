export function highestPrice(prices) {
    return prices.map((item) => [new Date(item.time).getTime(), item.price])
        .reduce(
            (prevWinner, item) => {
                if (item[0] > prevWinner[0]) {
                    return item;
                }
                return prevWinner;
            },
            [0, null]
        )[1]
    ;
}
