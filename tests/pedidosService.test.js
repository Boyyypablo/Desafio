const pedidosService = require('../src/services/pedidosService');
const pedidosRepository = require('../src/repository/pedidosRepository');

jest.mock('../src/repository/pedidosRepository');

describe('pedidosService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('list', () => {
    it('chama o repository com os filtros', async () => {
      pedidosRepository.findAll.mockResolvedValue([]);
      const filters = { status: 'RECEIVED' };
      const result = await pedidosService.list(filters);
      expect(pedidosRepository.findAll).toHaveBeenCalledWith(filters);
      expect(result).toEqual([]);
    });
  });

  describe('getById', () => {
    it('retorna o pedido se existir', async () => {
      const pedido = { order_id: '123', order: { total_price: 10 } };
      pedidosRepository.findById.mockResolvedValue(pedido);
      const result = await pedidosService.getById('123');
      expect(result).toEqual(pedido);
    });

    it('retorna null se nao existir', async () => {
      pedidosRepository.findById.mockResolvedValue(null);
      const result = await pedidosService.getById('nao-existe');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('cria pedido com status RECEIVED', async () => {
      pedidosRepository.create.mockImplementation((p) => Promise.resolve(p));
      const body = {
        store_id: 'store-1',
        order: {
          total_price: 30,
          items: [{ code: 1, price: 30, name: 'Item', quantity: 1 }],
        },
      };
      const result = await pedidosService.create(body);
      expect(result.order.last_status_name).toBe('RECEIVED');
      expect(result.order.statuses).toHaveLength(1);
      expect(result.order.statuses[0].name).toBe('RECEIVED');
      expect(result.order_id).toBeDefined();
    });
  });

  describe('update', () => {
    it('retorna null se pedido nao existir', async () => {
      pedidosRepository.findById.mockResolvedValue(null);
      const result = await pedidosService.update('nao-existe', {});
      expect(result).toBeNull();
    });

    it('atualiza o pedido se existir', async () => {
      const existing = {
        order_id: '123',
        order: { total_price: 10, items: [] },
      };
      pedidosRepository.findById.mockResolvedValue(existing);
      pedidosRepository.update.mockResolvedValue({ ...existing, order: { total_price: 20, items: [] } });

      const result = await pedidosService.update('123', { order: { total_price: 20 } });
      expect(pedidosRepository.update).toHaveBeenCalled();
      expect(result.order.total_price).toBe(20);
    });
  });

  describe('updateStatus', () => {
    it('retorna erro se pedido nao existir', async () => {
      pedidosRepository.findById.mockResolvedValue(null);
      const result = await pedidosService.updateStatus('nao-existe', 'CONFIRMED');
      expect(result.success).toBe(false);
      expect(result.error).toContain('não encontrado');
    });

    it('retorna erro para transicao invalida', async () => {
      const existing = {
        order_id: '123',
        order: { last_status_name: 'DELIVERED', statuses: [] },
      };
      pedidosRepository.findById.mockResolvedValue(existing);
      const result = await pedidosService.updateStatus('123', 'CONFIRMED');
      expect(result.success).toBe(false);
      expect(result.error).toContain('não permitida');
    });

    it('atualiza status para transicao valida', async () => {
      const existing = {
        order_id: '123',
        order: { last_status_name: 'RECEIVED', statuses: [] },
      };
      pedidosRepository.findById.mockResolvedValue(existing);
      pedidosRepository.update.mockResolvedValue({});

      const result = await pedidosService.updateStatus('123', 'CONFIRMED');
      expect(result.success).toBe(true);
      expect(result.pedido.order.last_status_name).toBe('CONFIRMED');
      expect(result.pedido.order.statuses).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('chama o repository para remover', async () => {
      pedidosRepository.remove.mockResolvedValue(true);
      const result = await pedidosService.remove('123');
      expect(pedidosRepository.remove).toHaveBeenCalledWith('123');
      expect(result).toBe(true);
    });
  });
});
