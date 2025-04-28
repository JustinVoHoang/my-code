const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3000;

// Middleware: simple request logger
app.use((req, res, next) => {
  console.log(`[Gateway] ${req.method} ${req.originalUrl}`);
  next();
});

// Service registry: ánh xạ serviceName -> URL backend
const serviceRegistry = {
  service1: 'http://localhost:4001',
  service2: 'http://localhost:4002',
  // Bạn có thể thêm nhiều service khác
};

// Dynamic route: /service/:serviceName/*
app.use('/service/:serviceName', (req, res, next) => {
  const { serviceName } = req.params;
  const target = serviceRegistry[serviceName];

  if (!target) {
    res.status(502).send(`No target found for service: ${serviceName}`);
    return;
  }

  // Tạo 1 proxy middleware mới
  const proxy = createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path, req) => {
      // Xóa `/service/serviceName` ra khỏi path
      return path.replace(`/service/${serviceName}`, '') || '/';
    },
  });

  // Gọi proxy
  proxy(req, res, next);
});

// Start Gateway
app.listen(PORT, () => {
  console.log(`Dynamic API Gateway running on http://localhost:${PORT}`);
});
