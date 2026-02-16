// Status validos no fluxo do pedido
const VALID_STATUSES = ['RECEIVED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELED'];

// Define quais transicoes sao permitidas a partir de cada status
const TRANSITIONS = {
  RECEIVED: ['CONFIRMED', 'CANCELED'],
  CONFIRMED: ['DISPATCHED', 'CANCELED'],
  DISPATCHED: ['DELIVERED', 'CANCELED'],
  DELIVERED: [],
  CANCELED: [],
};

// Checa se a transicao entre dois status e permitida
function canTransition(currentStatus, newStatus) {
  if (!VALID_STATUSES.includes(newStatus)) return false;
  const allowed = TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

// Valida a transicao e retorna o motivo do erro se nao for permitida
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
