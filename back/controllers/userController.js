const { db } = require('../config/db');

exports.getUserProfile = async (req, res) => {
    const username = req.query.username; // Obtener el username de los parámetros de consulta
    const email = req.query.email; // Obtener el email de los parámetros de consulta
    if (!username || !email) {
      return res.status(400).json({ message: 'Username y email son requeridos' });
    }
    try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef
        .where('username', '==', username)
        .where('email', '==', email)
        .get();
      
      if (snapshot.empty) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const user = snapshot.docs[0].data();
      res.status(200).json({
        username: user.username,
        email: user.email
      });
    } catch (error) {
      console.error('Error al obtener los datos del usuario:', error);
      res.status(500).json({ message: 'Error al obtener los datos del usuario' });
    }
  };