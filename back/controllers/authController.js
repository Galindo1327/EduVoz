const bcrypt = require('bcrypt');
const { db } = require('../config/db');

const handleDatabaseError = (res, error) => {
  console.error(error);
  res.status(500).json({ message: 'Error en la base de datos: ' + error.message });
};

exports.register = async (req, res) => {
  const { username, password, email, acceptTerms } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el usuario ya existe
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('username', '==', username).get();
    
    if (!userSnapshot.empty) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Verificar si el email ya está registrado
    const emailSnapshot = await usersRef.where('email', '==', email).get();
    if (!emailSnapshot.empty) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Crear el hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear el usuario en Firebase
    const newUser = await usersRef.add({
      username,
      password: hashedPassword,
      email,
      createdAt: new Date().toISOString(),
      acceptTerms: acceptTerms === true || acceptTerms === 'true',
      acceptedTermsAt: new Date().toISOString()
    });

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      userId: newUser.id 
    });
  } catch (error) {
    handleDatabaseError(res, error);
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Modo DEMO: usuario por defecto sin consultar BD
    const enableDefaultLogin = process.env.ENABLE_DEFAULT_LOGIN === 'true' || process.env.NODE_ENV !== 'production';
    if (enableDefaultLogin) {
      const DEFAULT_USER = process.env.DEFAULT_USER || 'demo';
      const DEFAULT_PASS = process.env.DEFAULT_PASS || 'demo123';

      if (username === DEFAULT_USER && password === DEFAULT_PASS) {
        return res.json({
          message: 'Inicio de sesión exitoso (modo demo)',
          userId: 'demo-user-id',
          username: DEFAULT_USER,
          demo: true
        });
      }
    }

    // Flujo normal: verificar contra Firebase
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('username', '==', username).get();

    if (userSnapshot.empty) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    const userDoc = userSnapshot.docs[0];
    const user = userDoc.data();
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    res.json({
      message: 'Inicio de sesión exitoso',
      userId: userDoc.id,
      username: user.username,
    });
  } catch (error) {
    handleDatabaseError(res, error);
  }
};
