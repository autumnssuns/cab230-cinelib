const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const express = require('express');
const router = express.Router();

const options = {
  swaggerDefinition: {
    info: {
      title: 'My Express API',
      version: '1.0.0',
      description: 'Documentation for my Express API',
    },
    basePath: '/',
  },
  apis: ['app.js'],
};

const swaggerSpec = swaggerJSDoc(options);

router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = router;
