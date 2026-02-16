const VALID_STATUSES = ['RECEIVED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELED'];

const TRANSITIONS = {
  RECEIVED: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['DISPATCHED', 'CANCELED'],
  DISPATCHED: ['DELIVERED', 'CANCELED'],
  DELIVERED: [],
  CANCELED: [],
};

function canTransition(currentStatus, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) return false;
  const allowed = TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

function validateTransition(currentStatus, newStatus) {
  if (!currentStatus) {
    return { valid: false, error: 'Pedido não encontrado' };
  }
  if (!VALID_STATUSES.includes(newStatus)) {
    return { valid: false, error: `Status inválido. Valores permitidos: ${VALID_STATUSES.join(', ')}` };
  }
  if (canTransition(currentStatus, newStatus)) {
    return { valid: true };
  }
  return {
    valid: false,
    error: `Transição de ${currentStatus} para ${newStatus} não permitida`,
  };
}

module.exports = {
  canTransition,
  validateTransition,
  VALID_STATUSES,
};
