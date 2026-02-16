// Schemas de validacao de entrada usando Zod
const { z } = require('zod');

const statusSchema = z.enum(['RECEIVED', 'CONFIRMED', 'DISPATCHED', 'DELIVERED', 'CANCELED']);

const updateStatusSchema = z.object({
  status: statusSchema,
});

function validateUpdateStatus(body) {
  return updateStatusSchema.safeParse(body);
}

const createPedidoSchema = z.object({
  store_id: z.string().optional(),
  order_id: z.string().uuid().optional(),
  order: z.object({
    payments: z.array(z.object({
      prepaid: z.boolean(),
      value: z.number(),
      origin: z.string(),
    })).optional(),
    store: z.object({
      name: z.string(),
      id: z.string(),
    }).optional(),
    total_price: z.number(),
    items: z.array(z.object({
      code: z.number(),
      price: z.number(),
      name: z.string(),
      quantity: z.number(),
      observations: z.string().nullable().optional(),
      total_price: z.number().optional(),
      discount: z.number().optional(),
      condiments: z.array(z.any()).optional(),
    })),
    customer: z.object({
      name: z.string(),
      temporary_phone: z.string().optional(),
    }).optional(),
    delivery_address: z.record(z.any()).optional(),
  }),
});

function validateCreatePedido(body) {
  return createPedidoSchema.safeParse(body);
}

module.exports = {
  validateUpdateStatus,
  validateCreatePedido,
};
