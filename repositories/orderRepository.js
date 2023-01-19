class OrderRepository {
    constructor() {
        this.orderBook = [];
    }

    add(order) {
        this.orderBook.push(order);
    }

    update(order) {
        for (let index = 0; index < this.orderBook.length; index++) {
            if (this.orderBook[index].id === order.id) {
                this.orderBook[index] = order;
            }
        }
    }

    getOrderBy(coin, qty, price, owner, side) {
        return this.orderBook.filter((item) =>
            item.coin === coin &&
            item.qty === qty &&
            item.price === price &&
            item.owner === owner &&
            item.side === side);
    }

    saveBook(book) {
        this.orderBook = book;
    }

    getBook() {
        return this.orderBook;
    }

    getById(orderId) {
        const result = this.orderBook.filter(item => item.id === orderId);
        if (result.length === 1)
            return result[0];

        return result
    }

    removeById(orderId) {
        this.orderBook.splice(this.orderBook.findIndex(item => item.id === orderId), 1)
    }
}

module.exports = OrderRepository;