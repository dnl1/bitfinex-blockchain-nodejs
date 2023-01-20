
const { assert, presence, oneOf, isNumeric, ValidationError } = require('property-validator');
const OrderRepository = require('../repositories/orderRepository');

class OrderService {
    constructor(orderRepository) {
        this.repository = orderRepository
    }

    create(order) {
        this.validate(order);
        this.repository.add(order);
        console.log('order added', order);
    }

    update(order){
        this.validate(order);
        this.repository.update(order);
    }

    validate(order) {
        assert(order, [
            presence('id'),
            presence('owner'),
            presence('coin'),
            presence('qty'),
            presence('status'),
            isNumeric('qty'),
            presence('price'),
            isNumeric('price'),
            presence('side'),
            oneOf('side', ['BUY', 'SELL'])
        ]);

        // validate if there's a order with opposite side
        const oppositeSide = order.side === 'BUY' ? 'SELL' : 'BUY';
        const oppositedOrder = this.repository.getOrderBy(order.coin, order.qty, order.price, order.owner, oppositeSide)

        if (oppositedOrder.length > 0) {
            const msgs = ['The same owner cant put an opposite order on the book'];
            throw new ValidationError({ messages: msgs });
        }
    }

    getBook() {
        return this.repository.getBook();
    }

    saveBook(book){
        this.repository.saveBook(book)
    }

    getById(orderId){
        return this.repository.getById(orderId);
    }

    removeById(orderId) {
        return this.repository.removeById(orderId);
    }
}

module.exports = OrderService;