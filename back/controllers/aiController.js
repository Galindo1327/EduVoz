const { GoogleGenerativeAI } = require('@google/generative-ai');
const textToSpeech = require('@google-cloud/text-to-speech');
const PDFExtract = require('pdf.js-extract').PDFExtract;
const axios = require('axios');
const { db, bucket } = require('../config/db');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Inicializar Gemini
const genAI = new GoogleGenerativeAI('AIzaSyDvDA3EoMvPhEzXLDb0CgQtcM2crMyqIZM');

// Inicializar Google TTS con las credenciales correctas
const serviceAccountPath = path.join(__dirname, '..', 'config', 'ServiceAccountKey.json');
const ttsClient = new textToSpeech.TextToSpeechClient({
  keyFilename: serviceAccountPath
});

// Inicializar PDF Extractor
const pdfExtract = new PDFExtract();

/**
 * Extrae texto de un PDF desde una URL
 */
const extractTextFromPDF = async (pdfUrl) => {
  let tempFilePath = null;
  
  try {
    console.log('📄 Descargando PDF desde:', pdfUrl);
    
    // Descargar el PDF
    const response = await axios.get(pdfUrl, {
      responseType: 'arraybuffer'
    });
    
    // Guardar temporalmente el PDF
    tempFilePath = path.join(os.tmpdir(), `temp_${Date.now()}.pdf`);
    fs.writeFileSync(tempFilePath, Buffer.from(response.data));
    
    // Extraer texto del PDF
    console.log('📖 Extrayendo texto del PDF...');
    const data = await pdfExtract.extract(tempFilePath, {});
    
    // Combinar el texto de todas las páginas
    let fullText = '';
    data.pages.forEach(page => {
      page.content.forEach(item => {
        if (item.str) {
          fullText += item.str + ' ';
        }
      });
      fullText += '\n';
    });
    
    console.log(`✅ Texto extraído: ${fullText.length} caracteres`);
    
    // Limpiar archivo temporal
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    return fullText.trim();
  } catch (error) {
    console.error('❌ Error al extraer texto del PDF:', error);
    
    // Limpiar archivo temporal en caso de error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    throw new Error('Error al procesar el PDF: ' + error.message);
  }
};

/**
 * Genera respuesta usando Gemini AI
 */
const generateAIResponse = async (pdfText, userPrompt) => {
  try {
    console.log('🤖 Llamando a Gemini AI...');
    
    // Limitar el texto del PDF si es muy largo (máximo 30,000 caracteres)
    const maxLength = 30000;
    const truncatedText = pdfText.length > maxLength 
      ? pdfText.substring(0, maxLength) + '\n\n[Texto truncado por longitud...]'
      : pdfText;
    
    // Construir el prompt completo
    const fullPrompt = `
CONTEXTO: Eres un asistente educativo inteligente. El usuario ha subido un documento PDF y necesita tu ayuda.

CONTENIDO DEL PDF:
${truncatedText}

INSTRUCCIÓN DEL USUARIO:
${userPrompt}

Por favor, responde de manera clara, precisa y en español según la instrucción del usuario.
Si el prompt pide un resumen, hazlo conciso. Si pide explicaciones, sé detallado.
Si pide preguntas, genera preguntas relevantes. Adapta tu respuesta a lo que el usuario pidió.
`;

    // Llamar a Gemini (usando gemini-1.5-pro que está disponible en la API gratuita)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const aiText = response.text();
    
    console.log(`✅ Respuesta de IA generada: ${aiText.length} caracteres`);
    return aiText;
  } catch (error) {
    console.error('❌ Error al generar respuesta con IA:', error);
    throw new Error('Error al procesar con IA: ' + error.message);
  }
};

/**
 * Limpia el Markdown del texto para que el TTS no lea los símbolos
 */
const cleanMarkdownForTTS = (text) => {
  return text
    // Eliminar negritas (**texto** o __texto__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Eliminar itálicas (*texto* o _texto_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Eliminar encabezados (# texto)
    .replace(/^#{1,6}\s+/gm, '')
    // Eliminar listas (- texto o * texto)
    .replace(/^[\*\-]\s+/gm, '')
    // Eliminar números de lista (1. texto)
    .replace(/^\d+\.\s+/gm, '')
    // Eliminar enlaces [texto](url)
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    // Eliminar código en línea (`texto`)
    .replace(/`(.+?)`/g, '$1')
    // Eliminar bloques de código (```texto```)
    .replace(/```[\s\S]*?```/g, '')
    // Limpiar espacios múltiples
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Convierte texto a audio usando Google TTS
 */
const convertTextToSpeech = async (text, projectId) => {
  try {
    console.log('🔊 Convirtiendo texto a audio...');
    
    // Limpiar el Markdown antes de convertir a audio
    const cleanText = cleanMarkdownForTTS(text);
    
    // Limitar el texto si es muy largo (TTS tiene límites)
    const maxLength = 5000;
    const truncatedText = cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '... El resto del contenido fue omitido por longitud.'
      : cleanText;
    
    console.log('📝 Texto limpio para TTS:', truncatedText.substring(0, 100) + '...');
    
    // Configurar la solicitud de TTS
    const request = {
      input: { text: truncatedText },
      voice: { 
        languageCode: 'es-ES', 
        name: 'es-ES-Standard-A', // Voz femenina en español
        ssmlGender: 'FEMALE' 
      },
      audioConfig: { 
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0
      },
    };

    // Generar audio
    const [response] = await ttsClient.synthesizeSpeech(request);
    const audioBuffer = response.audioContent;
    
    console.log('✅ Audio generado exitosamente');
    
    // Subir audio a Firebase Storage
    const fileName = `audios/${Date.now()}_${projectId}.mp3`;
    const file = bucket.file(fileName);
    
    await file.save(audioBuffer, {
      metadata: {
        contentType: 'audio/mpeg',
      },
    });
    
    // Hacer el archivo público
    await file.makePublic();
    const audioUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log('✅ Audio subido a Firebase:', audioUrl);
    return audioUrl;
  } catch (error) {
    console.error('❌ Error al generar audio:', error);
    throw new Error('Error al generar audio: ' + error.message);
  }
};

/**
 * Endpoint principal: Procesar PDF con IA
 */
exports.processWithAI = async (req, res) => {
  const { projectId, userPrompt, generateAudio } = req.body;
  
  console.log('\n🚀 === PROCESANDO CON IA ===');
  console.log('📋 Project ID:', projectId);
  console.log('💬 User Prompt:', userPrompt);
  console.log('🔊 Generate Audio:', generateAudio);
  
  try {
    // Validar entrada
    if (!projectId || !userPrompt) {
      return res.status(400).json({ 
        message: 'Se requiere projectId y userPrompt' 
      });
    }
    
    // 1. Obtener proyecto de Firestore
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ 
        message: 'Proyecto no encontrado' 
      });
    }
    
    const projectData = projectDoc.data();
    
    if (!projectData.pdfUrl) {
      return res.status(400).json({ 
        message: 'Este proyecto no tiene un PDF asociado' 
      });
    }
    
    // 2. Extraer texto del PDF
    const pdfText = await extractTextFromPDF(projectData.pdfUrl);
    
    // 3. Generar respuesta con Gemini
    const aiResponse = await generateAIResponse(pdfText, userPrompt);
    
    // 4. Generar audio si se solicitó
    let audioUrl = null;
    if (generateAudio === true || generateAudio === 'true') {
      audioUrl = await convertTextToSpeech(aiResponse, projectId);
    }
    
    // 5. Actualizar proyecto en Firestore (SIN HISTORIAL, solo última interacción)
    await projectRef.update({
      lastAIPrompt: userPrompt,
      lastAIResponse: aiResponse,
      lastAudioUrl: audioUrl,
      lastProcessedAt: new Date().toISOString()
    });
    
    console.log('✅ === PROCESAMIENTO COMPLETADO ===\n');
    
    // 6. Devolver respuesta
    return res.status(200).json({
      success: true,
      message: 'Procesamiento completado',
      data: {
        prompt: userPrompt,
        response: aiResponse,
        audioUrl: audioUrl,
        audioGenerated: !!audioUrl
      }
    });
    
  } catch (error) {
    console.error('❌ Error en processWithAI:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error al procesar con IA',
      error: error.message 
    });
  }
};

/**
 * Obtener última respuesta de IA para un proyecto
 */
exports.getLastAIResponse = async (req, res) => {
  const projectId = req.params.projectId;
  
  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    
    const data = projectDoc.data();
    
    return res.status(200).json({
      success: true,
      data: {
        prompt: data.lastAIPrompt || null,
        response: data.lastAIResponse || null,
        audioUrl: data.lastAudioUrl || null,
        processedAt: data.lastProcessedAt || null,
        hasResponse: !!data.lastAIResponse
      }
    });
    
  } catch (error) {
    console.error('Error al obtener respuesta de IA:', error);
    return res.status(500).json({ 
      message: 'Error al obtener datos',
      error: error.message 
    });
  }
};

module.exports = exports;
