const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Procesar PDF con IA (Gemini + TTS)
router.post('/process', aiController.processWithAI);

// Obtener última respuesta de IA para un proyecto
router.get('/response/:projectId', aiController.getLastAIResponse);

module.exports = router;
