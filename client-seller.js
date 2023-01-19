'use strict'

const { PeerRPCClient } = require('grenache-nodejs-http')
const { PeerSub } = require('grenache-nodejs-ws');

const Link = require('grenache-nodejs-link')

// own instace of the service of orderbook
const OrderService = require('./services/orderService');
const OrderRepository = require('./repositories/orderRepository');

const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);

const link = new Link({
  grape: 'http://127.0.0.1:30001'
});

link.start()
const peer = new PeerRPCClient(link, {})
peer.init()

const peerSub = new PeerSub(link, {})
peerSub.init()

peerSub.sub('trade_service', { timeout: 10000 })

peerSub.on('message', (msg) => {
  const book = JSON.parse(msg);
  const myBook = book.filter(b => b.owner = owner);
  orderService.saveBook(myBook);
});

const owner = 'danilo'
const baseOrder = { coin: 'ETHUSD', qty: 100, price: 10, side: 'SELL', owner: owner };

peer.request('order_service', baseOrder, { timeout: 10000 }, (err, data) => {
  if (err) {
    console.error(err)
    process.exit(-1)
  }

  orderService.create(data.order)
});