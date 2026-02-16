// Camada de acesso aos dados. Le e grava no arquivo pedidos.json
const fs = require('fs').promises;
const path = require('path');

const PEDIDOS_FILE = path.resolve(process.cwd(), process.env.PEDIDOS_FILE || 'pedidos.json');

async function readPedidos() {
  const data = await fs.readFile(PEDIDOS_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writePedidos(pedidos) {
  await fs.writeFile(PEDIDOS_FILE, JSON.stringify(pedidos, null, 2), 'utf-8');
}

async function findAll(filters = {}) {
  let pedidos = await readPedidos();
  if (filters.status) {
    pedidos = pedidos.filter((p) => p.order?.last_status_name === filters.status);
  }
  if (filters.store_id) {
    pedidos = pedidos.filter((p) => p.store_id === filters.store_id);
  }
  return pedidos;
}

async function findById(orderId) {
  const pedidos = await readPedidos();
  return pedidos.find((p) => p.order_id === orderId) || null;
}

async function create(pedido) {
  const pedidos = await readPedidos();
  pedidos.push(pedido);
  await writePedidos(pedidos);
  return pedido;
}

async function update(orderId, updates) {
  const pedidos = await readPedidos();
  const index = pedidos.findIndex((p) => p.order_id === orderId);
  if (index === -1) return null;
  pedidos[index] = { ...pedidos[index], ...updates };
  await writePedidos(pedidos);
  return pedidos[index];
}

async function remove(orderId) {
  const pedidos = await readPedidos();
  const filtered = pedidos.filter((p) => p.order_id !== orderId);
  if (filtered.length === pedidos.length) return false;
  await writePedidos(filtered);
  return true;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  remove,
};
