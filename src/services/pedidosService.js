const crypto = require('crypto');
const pedidosRepository = require('../repository/pedidosRepository');
const { validateTransition } = require('./stateMachine');

// Gera um UUID. Usa crypto.randomUUID se disponivel, senao gera manualmente
function generateId() {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Monta um pedido novo. Sempre comeca com status RECEIVED
function buildNewPedido(body) {
  const orderId = body.order_id || generateId();
  const now = Date.now();
  const initialStatus = {
    created_at: now,
    name: 'RECEIVED',
    order_id: orderId,
    origin: 'STORE',
  };
  const order = {
    ...body.order,
    order_id: orderId,
    last_status_name: 'RECEIVED',
    created_at: body.order?.created_at || now,
    statuses: [initialStatus],
  };
  return {
    store_id: body.store_id || body.order?.store?.id,
    order_id: orderId,
    order,
  };
}

async function list(filters) {
  return pedidosRepository.findAll(filters);
}

async function getById(orderId) {
  return pedidosRepository.findById(orderId);
}

async function create(body) {
  const pedido = buildNewPedido(body);
  return pedidosRepository.create(pedido);
}

async function update(orderId, body) {
  const existing = await pedidosRepository.findById(orderId);
  if (!existing) return null;
  const updatedOrder = { ...existing.order, ...body.order };
  const updates = { ...body, order: updatedOrder };
  delete updates.order_id;
  return pedidosRepository.update(orderId, updates);
}

// Atualiza o status do pedido respeitando as transicoes da state machine
async function updateStatus(orderId, newStatus) {
  const existing = await pedidosRepository.findById(orderId);
  if (!existing) return { success: false, error: 'Pedido não encontrado' };

  const currentStatus = existing.order?.last_status_name;
  const validation = validateTransition(currentStatus, newStatus);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const now = Date.now();
  const newStatusEntry = {
    created_at: now,
    name: newStatus,
    order_id: orderId,
    origin: 'STORE',
  };
  const updatedOrder = {
    ...existing.order,
    last_status_name: newStatus,
    statuses: [...(existing.order?.statuses || []), newStatusEntry],
  };
  await pedidosRepository.update(orderId, { order: updatedOrder });
  return { success: true, pedido: { ...existing, order: updatedOrder } };
}

async function remove(orderId) {
  return pedidosRepository.remove(orderId);
}

module.exports = {
  list,
  getById,
  create,
  update,
  updateStatus,
  remove,
};
