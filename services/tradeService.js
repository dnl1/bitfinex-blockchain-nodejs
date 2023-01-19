const { PARTIALLY_FILLED, FILLED, SELL, BUY } = require('../constants');

class TradeService {
    constructor(orderService) {
        this.orderService = orderService
    }    

    doMatches() {
        const book = this.orderService.getBook();
        let groupedBook = {};
        const coins = [...new Set(book.map(b => b.coin))];

        //populate groupBook and
        //is there a match?
        for (let coin of coins) {
            groupedBook[coin] = book.filter(b => b.coin === coin && b.status !== FILLED).sort((a, b) => a.price > b.price ? a : b);
            const sellOrders = groupedBook[coin].filter(b => b.side == SELL);
            const buyOrders = groupedBook[coin].filter(b => b.side == BUY);
            const minorIdx = sellOrders.length < buyOrders.length ? sellOrders.length : buyOrders.length

            for (let index = 0; index < minorIdx; index++) {
                const buyOrder = buyOrders[index];
                const sellOrdersFiltered = sellOrders.filter(o => o.price === buyOrder.price)
                if (sellOrdersFiltered.length > 0) {
                    let sellOrder = sellOrdersFiltered[0];

                    buyOrder.status = sellOrder.qty < buyOrder.qty ? PARTIALLY_FILLED : FILLED;
                    sellOrder.status = buyOrder.qty < sellOrder.qty ? PARTIALLY_FILLED : FILLED;

                    if(buyOrder.status === PARTIALLY_FILLED){
                        buyOrder.qty -= sellOrder.qty
                    }

                    if(sellOrder.status === PARTIALLY_FILLED){
                        sellOrder.qty -= buyOrder.qty
                    }

                    this.orderService.update(buyOrder)
                    this.orderService.update(sellOrder)

                    const book = this.orderService.getBook();
                    console.log('book', book);
                }
            }
        }
    }
}

module.exports = TradeService;
