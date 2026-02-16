const { canTransition, validateTransition, VALID_STATUSES } = require('../src/services/stateMachine');

describe('stateMachine', () => {
  describe('canTransition', () => {
    it('RECEIVED pode ir para CONFIRMED', () => {
      expect(canTransition('RECEIVED', 'CONFIRMED')).toBe(true);
    });

    it('RECEIVED pode ir para CANCELED', () => {
      expect(canTransition('RECEIVED', 'CANCELED')).toBe(true);
    });

    it('CONFIRMED pode ir para DISPATCHED', () => {
      expect(canTransition('CONFIRMED', 'DISPATCHED')).toBe(true);
    });

    it('CONFIRMED pode ir para CANCELED', () => {
      expect(canTransition('CONFIRMED', 'CANCELED')).toBe(true);
    });

    it('DISPATCHED pode ir para DELIVERED', () => {
      expect(canTransition('DISPATCHED', 'DELIVERED')).toBe(true);
    });

    it('DISPATCHED pode ir para CANCELED', () => {
      expect(canTransition('DISPATCHED', 'CANCELED')).toBe(true);
    });

    it('DELIVERED nao pode mudar', () => {
      expect(canTransition('DELIVERED', 'RECEIVED')).toBe(false);
      expect(canTransition('DELIVERED', 'CONFIRMED')).toBe(false);
      expect(canTransition('DELIVERED', 'CANCELED')).toBe(false);
    });

    it('CANCELED nao pode mudar', () => {
      expect(canTransition('CANCELED', 'RECEIVED')).toBe(false);
      expect(canTransition('CANCELED', 'CONFIRMED')).toBe(false);
      expect(canTransition('CANCELED', 'DELIVERED')).toBe(false);
    });

    it('RECEIVED nao pode pular para DELIVERED', () => {
      expect(canTransition('RECEIVED', 'DELIVERED')).toBe(false);
    });

    it('RECEIVED nao pode pular para DISPATCHED', () => {
      expect(canTransition('RECEIVED', 'DISPATCHED')).toBe(false);
    });

    it('retorna false para status invalido', () => {
      expect(canTransition('RECEIVED', 'QUALQUER_COISA')).toBe(false);
    });

    it('retorna false para status atual inexistente', () => {
      expect(canTransition('NAO_EXISTE', 'CONFIRMED')).toBe(false);
    });
  });

  describe('validateTransition', () => {
    it('retorna valid true para transicao permitida', () => {
      const result = validateTransition('RECEIVED', 'CONFIRMED');
      expect(result.valid).toBe(true);
    });

    it('retorna erro para transicao proibida', () => {
      const result = validateTransition('RECEIVED', 'DELIVERED');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não permitida');
    });

    it('retorna erro para status invalido', () => {
      const result = validateTransition('RECEIVED', 'INVENTADO');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Status inválido');
    });

    it('retorna erro quando status atual e nulo', () => {
      const result = validateTransition(null, 'CONFIRMED');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('não encontrado');
    });
  });

  describe('VALID_STATUSES', () => {
    it('tem 5 status', () => {
      expect(VALID_STATUSES).toHaveLength(5);
    });

    it('contem todos os status esperados', () => {
      expect(VALID_STATUSES).toEqual(
        expect.arrayContaining(['RECEIVED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELED']),
      );
    });
  });
});
