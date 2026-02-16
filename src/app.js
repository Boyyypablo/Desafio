const express = require('express');
const path = require('path');
const pedidosRoutes = require('./routes/pedidos');

const app = express();

app.use(express.json());

app.use('/api/pedidos', pedidosRoutes);

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

module.exports = app;
