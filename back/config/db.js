// Configuración de Firebase
const admin = require('firebase-admin');

// Cargar credenciales de Firebase
const serviceAccount = require('./ServiceAccountKey.json');

// Inicializar Firebase Admin
const initializeFirebase = () => {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: "novamarketapp.appspot.com" // Bucket de tu proyecto
    });

    console.log('✅ Firebase inicializado correctamente');
    console.log('� Proyecto:', serviceAccount.project_id);
    console.log('🗄️  Storage Bucket: novamarketapp.appspot.com');
    
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error);
  }
};

// Inicializar Firebase
initializeFirebase();

// Obtener referencias a Firestore y Storage
const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = {
  admin,
  db,
  bucket,
  initializeFirebase
};
  