const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI('AIzaSyDvDA3EoMvPhEzXLDb0CgQtcM2crMyqIZM');

async function listModels() {
  try {
    console.log('🔍 Consultando modelos disponibles...\n');
    const models = await genAI.listModels();
    
    console.log('📋 MODELOS DISPONIBLES:');
    console.log('========================\n');
    
    models.forEach(model => {
      console.log(`✅ ${model.name}`);
      console.log(`   Descripción: ${model.displayName || 'N/A'}`);
      console.log(`   Soporta generateContent: ${model.supportedGenerationMethods?.includes('generateContent') ? 'Sí' : 'No'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
