'use strict'

const { PeerRPCServer } = require('grenache-nodejs-http');
const { PeerPub } = require('grenache-nodejs-ws');
const Link = require('grenache-nodejs-link');

const OrderRepository = require('./repositories/orderRepository');
const OrderService = require('./services/orderService');
const TradeService = require('./services/tradeService');

//using di, lifecycle as singleton
const orderRepository = new OrderRepository();
const orderService = new OrderService(orderRepository);
const tradeService = new TradeService(orderService);

const link = new Link({
  grape: 'http://127.0.0.1:30001'
})
link.start()

const peer = new PeerRPCServer(link, {
  timeout: 300000
})
peer.init()

const port = 1024 + Math.floor(Math.random() * 1000)
const service = peer.transport('server')
service.listen(port)

const peerPub = new PeerPub(link, {})
peerPub.init()

const pubPort = 1024 + Math.floor(Math.random() * 1000)
const servicePub = peerPub.transport('server')
servicePub.listen(pubPort)

setInterval(function () {
  link.announce('order_service', service.port, {});
  link.announce('trade_service', servicePub.port, {});
}, 1000)

//matcher
setInterval(function () {
  tradeService.doMatches();
}, 5000)

//publisher
setInterval(function() {
  let book = orderService.getBook();
  servicePub.pub(JSON.stringify(book));
}, 3000)

service.on('request', (rid, key, payload, handler) => {
  const order = {
    id: rid,
    status: 'NEW',
    ...payload,
  }

  try {
    orderService.create(order);
  } catch (e) {
    handler.reply(null, { success: false, errors: e.messages, type: 'request' });
    return;
  }

  handler.reply(null, { success: true, order: order, type: 'request' });
})