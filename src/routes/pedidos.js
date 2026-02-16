const express = require('express');
const router = express.Router();
const pedidosService = require('../services/pedidosService');
const { validateUpdateStatus, validateCreatePedido } = require('../utils/validators');

router.get('/', async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      store_id: req.query.store_id,
    };
    const pedidos = await pedidosService.list(filters);
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pedido = await pedidosService.getById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = validateCreatePedido(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: result.error.flatten().fieldErrors,
      });
    }
    const pedido = await pedidosService.create(req.body);
    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const pedido = await pedidosService.update(req.params.id, req.body);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/status', async (req, res) => {
  try {
    const result = validateUpdateStatus(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Dados inválidos',
        details: result.error.flatten().fieldErrors,
      });
    }
    const { status } = result.data;
    const updateResult = await pedidosService.updateStatus(req.params.id, status);
    if (!updateResult.success) {
      const statusCode = updateResult.error?.includes('não encontrado') ? 404 : 400;
      return res.status(statusCode).json({ error: updateResult.error });
    }
    res.json(updateResult.pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const removed = await pedidosService.remove(req.params.id);
    if (!removed) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
