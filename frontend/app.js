const API_BASE = '/api/pedidos';

async function fetchPedidos(status) {
  const url = status ? `${API_BASE}?status=${status}` : API_BASE;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao carregar pedidos');
  return res.json();
}

function formatPrice(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(timestamp) {
  if (!timestamp) return '-';
  return new Date(timestamp).toLocaleString('pt-BR');
}

const STATUS_ORDER = { RECEIVED: 1, CONFIRMED: 2, DISPATCHED: 3, DELIVERED: 4, CANCELED: 5 };

function sortPedidos(pedidos, sortBy) {
  const arr = [...pedidos];
  switch (sortBy) {
    case 'created_desc':
      return arr.sort((a, b) => (b.order?.created_at ?? 0) - (a.order?.created_at ?? 0));
    case 'created_asc':
      return arr.sort((a, b) => (a.order?.created_at ?? 0) - (b.order?.created_at ?? 0));
    case 'total_desc':
      return arr.sort((a, b) => (b.order?.total_price ?? 0) - (a.order?.total_price ?? 0));
    case 'total_asc':
      return arr.sort((a, b) => (a.order?.total_price ?? 0) - (b.order?.total_price ?? 0));
    case 'status':
      return arr.sort((a, b) => {
        const sa = STATUS_ORDER[a.order?.last_status_name] ?? 0;
        const sb = STATUS_ORDER[b.order?.last_status_name] ?? 0;
        return sa - sb;
      });
    default:
      return arr;
  }
}

function buildDetailsHtml(p) {
  const order = p.order || {};
  const addr = order.delivery_address;
  const addressStr = addr
    ? `${addr.street_name}, ${addr.street_number} - ${addr.neighborhood}, ${addr.city}/${addr.state}`
    : '-';
  const payments = order.payments?.map((pay) =>
    `${pay.origin}: ${formatPrice(pay.value)} (${pay.prepaid ? 'pago' : 'a pagar'})`
  ).join(' | ') || '-';
  const statusHistory = order.statuses
    ?.sort((a, b) => a.created_at - b.created_at)
    ?.map((s) => `${s.name} em ${formatDate(s.created_at)}`)
    ?.join(' → ') || '-';

  return `
    <div class="pedido-details">
      <h4>Endereço de entrega</h4>
      <p>${addressStr}</p>
      <h4>Pagamento</h4>
      <p>${payments}</p>
      <h4>Histórico de status</h4>
      <p>${statusHistory}</p>
    </div>
  `;
}

function renderPedidos(pedidos) {
  const list = document.getElementById('pedidosList');
  const loading = document.getElementById('loading');
  const sortBy = document.getElementById('sortBy').value;
  loading.style.display = 'none';

  if (!pedidos.length) {
    list.innerHTML = '<li class="pedido-card">Nenhum pedido encontrado.</li>';
    return;
  }

  const sorted = sortPedidos(pedidos, sortBy);

  list.innerHTML = sorted.map((p, idx) => {
    const order = p.order || {};
    const status = order.last_status_name || 'RECEIVED';
    const customer = order.customer?.name || '-';
    const store = order.store?.name || p.store_id || '-';
    const total = order.total_price ?? 0;
    const items = order.items?.map((i) => `${i.name} (x${i.quantity})`).join(', ') || '-';

    return `
      <li class="pedido-card" data-index="${idx}">
        <div class="pedido-header">
          <div>
            <h3>Pedido ${p.order_id?.slice(0, 8) || '-'}...</h3>
            <div class="pedido-meta">Cliente: ${customer}</div>
            <div class="pedido-meta">Loja: ${store}</div>
            <div class="pedido-meta">Itens: ${items}</div>
            <div class="pedido-meta">Total: ${formatPrice(total)}</div>
            <div class="pedido-meta">Criado: ${formatDate(order.created_at)}</div>
            <span class="status status-${status}">${status}</span>
          </div>
          <button type="button" class="btn-details" data-index="${idx}" aria-expanded="false">
            Ver detalhes
          </button>
        </div>
        <div class="pedido-details-wrap" id="details-${idx}" hidden></div>
      </li>
    `;
  }).join('');

  sorted.forEach((p, idx) => {
    const wrap = document.getElementById(`details-${idx}`);
    if (wrap) wrap.innerHTML = buildDetailsHtml(p);
  });
}

let lastPedidos = [];

async function loadPedidos() {
  const list = document.getElementById('pedidosList');
  const loading = document.getElementById('loading');
  loading.style.display = 'block';
  list.innerHTML = '';

  try {
    const status = document.getElementById('filterStatus').value;
    const pedidos = await fetchPedidos(status || undefined);
    lastPedidos = pedidos;
    renderPedidos(pedidos);
  } catch (err) {
    loading.style.display = 'none';
    list.innerHTML = `<li class="pedido-card">Erro: ${err.message}</li>`;
  }
}

function applySort() {
  renderPedidos(lastPedidos);
}

document.getElementById('filterStatus').addEventListener('change', loadPedidos);
document.getElementById('sortBy').addEventListener('change', applySort);
document.getElementById('btnRefresh').addEventListener('click', loadPedidos);

document.getElementById('pedidosList').addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-details');
  if (!btn) return;
  const idx = btn.dataset.index;
  const wrap = document.getElementById(`details-${idx}`);
  if (!wrap) return;
  const isOpen = !wrap.hidden;
  wrap.hidden = isOpen;
  btn.textContent = isOpen ? 'Ver detalhes' : 'Ocultar detalhes';
  btn.setAttribute('aria-expanded', !isOpen);
});

loadPedidos();
