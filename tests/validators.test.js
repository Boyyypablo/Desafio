const { validateUpdateStatus, validateCreatePedido } = require('../src/utils/validators');

describe('validators', () => {
  describe('validateUpdateStatus', () => {
    it('aceita status valido', () => {
      const result = validateUpdateStatus({ status: 'CONFIRMED' });
      expect(result.success).toBe(true);
    });

    it('rejeita status invalido', () => {
      const result = validateUpdateStatus({ status: 'INVALIDO' });
      expect(result.success).toBe(false);
    });

    it('rejeita body vazio', () => {
      const result = validateUpdateStatus({});
      expect(result.success).toBe(false);
    });

    it('aceita todos os status validos', () => {
      const statuses = ['RECEIVED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELED'];
      statuses.forEach((status) => {
        const result = validateUpdateStatus({ status });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('validateCreatePedido', () => {
    const pedidoValido = {
      store_id: 'store-123',
      order: {
        total_price: 50.0,
        items: [
          {
            code: 1,
            price: 50.0,
            name: 'Hamburguer',
            quantity: 1,
          },
        ],
      },
    };

    it('aceita pedido valido', () => {
      const result = validateCreatePedido(pedidoValido);
      expect(result.success).toBe(true);
    });

    it('rejeita pedido sem order', () => {
      const result = validateCreatePedido({ store_id: 'store-123' });
      expect(result.success).toBe(false);
    });

    it('rejeita pedido sem items', () => {
      const result = validateCreatePedido({
        order: { total_price: 50.0 },
      });
      expect(result.success).toBe(false);
    });

    it('rejeita pedido sem total_price', () => {
      const result = validateCreatePedido({
        order: {
          items: [{ code: 1, price: 10, name: 'Item', quantity: 1 }],
        },
      });
      expect(result.success).toBe(false);
    });

    it('aceita pedido com campos opcionais', () => {
      const pedidoCompleto = {
        ...pedidoValido,
        order: {
          ...pedidoValido.order,
          customer: { name: 'Joao' },
          payments: [{ prepaid: true, value: 50.0, origin: 'CREDIT_CARD' }],
          store: { name: 'Loja Teste', id: 'store-123' },
        },
      };
      const result = validateCreatePedido(pedidoCompleto);
      expect(result.success).toBe(true);
    });
  });
});
