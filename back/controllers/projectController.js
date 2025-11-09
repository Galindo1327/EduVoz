const { db, bucket } = require('../config/db');

// Función para subir PDF a Firebase Storage
exports.uploadPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se proporcionó ningún archivo' });
    }

    const file = req.file;
    const fileName = `pdfs/${Date.now()}_${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    stream.on('error', (error) => {
      console.error('Error al subir archivo:', error);
      return res.status(500).json({ message: 'Error al subir el archivo' });
    });

    stream.on('finish', async () => {
      // Hacer el archivo público y obtener la URL
      await fileUpload.makePublic();
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
      
      console.log('✅ PDF subido exitosamente:', publicUrl);
      res.status(200).json({ 
        message: 'PDF subido exitosamente',
        pdfUrl: publicUrl 
      });
    });

    stream.end(file.buffer);
  } catch (error) {
    console.error('Error al procesar la subida:', error);
    res.status(500).json({ message: 'Error al procesar la subida del archivo' });
  }
};

exports.createProject = async (req, res) => {
  const { name, description, date, pdfUrl } = req.body;
  const username = req.body.username;

  try {
    console.log("Creando lectura para el usuario:", username);
    const projectData = {
      name,
      description,
      date,
      username,
      createdAt: new Date().toISOString(),
      pdfUrl: pdfUrl || null
    };

    const projectRef = await db.collection('projects').add(projectData);
    const newProject = await projectRef.get();

    return res.status(201).json({
      message: 'Lectura creada exitosamente',
      project: {
        id: projectRef.id,
        ...newProject.data()
      }
    });
  } catch (error) {
    console.error("Error al crear la lectura:", error);
    return res.status(500).json({ message: 'Error al crear la lectura' });
  }
};

exports.getProjects = async (req, res) => {
  const username = req.query.username;  
  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido' });
  }

  try {
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.where('username', '==', username).get();
    console.log("Obteniendo lecturas para el usuario:", username);
    const projects = [];
    snapshot.forEach(doc => {
      projects.push({ id: doc.id, ...doc.data() });
    });
    return res.status(200).json(projects);
  } catch (error) {
    console.error("Error al obtener lecturas:", error);
    return res.status(500).json({ message: 'Error al obtener lecturas' });
  }
};

exports.deleteProject = async (req, res) => {
  const projectId = req.params.id;
  const username = req.query.username; 

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Lectura no encontrada' });
    }
    const projectData = projectDoc.data();
    if (projectData.username !== username) {
      return res.status(403).json({ message: 'No autorizado para eliminar esta lectura' });
    }
    await projectRef.delete();
    res.status(200).json({ message: 'Lectura eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la lectura' });
  }
};

exports.updateProject = async (req, res) => {
  const projectId = req.params.id;
  const { name, description, date } = req.body;
  const username = req.body.username;

  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Lectura no encontrada' });
    }
    const projectData = projectDoc.data();
    if (projectData.username !== username) {
      return res.status(403).json({ message: 'No autorizado para editar esta lectura' });
    }
    const updatedData = { name, description, date, updatedAt: new Date().toISOString() };
    await projectRef.update(updatedData);
    const updatedDoc = await projectRef.get();
    res.status(200).json({ project: { id: projectRef.id, ...updatedDoc.data() } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la lectura' });
  }
};

// Funciones adicionales para gestión de proyectos y tareas - Firebase

exports.getProjectById = async (req, res) => {
  const projectId = req.params.id;
  try {
    const projectRef = db.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Proyecto no encontrado' });
    }
    res.status(200).json({ id: projectDoc.id, ...projectDoc.data() });
  } catch (error) {
    console.error('Error al obtener el proyecto:', error);
    res.status(500).json({ message: 'Error al obtener el proyecto' });
  }
};

exports.getTasksByProjectId = async (req, res) => {
  const projectId = req.params.id;
  try {
    const tasksRef = db.collection('tasks');
    const snapshot = await tasksRef.where('project_id', '==', projectId).get();
    const tasks = [];
    snapshot.forEach(doc => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error al obtener las tareas:', error);
    res.status(500).json({ message: 'Error al obtener las tareas' });
  }
};

exports.createTask = async (req, res) => {
  const projectId = req.params.id;
  const { name, description, status } = req.body;
  try {
    const taskData = { name, description, status, project_id: projectId, createdAt: new Date().toISOString() };
    const taskRef = await db.collection('tasks').add(taskData);
    const newTask = await taskRef.get();
    res.status(201).json({ id: taskRef.id, ...newTask.data() });
  } catch (error) {
    console.error('Error al crear la tarea:', error);
    res.status(500).json({ message: 'Error al crear la tarea' });
  }
};

exports.updateTask = async (req, res) => {
  const taskId = req.params.taskId;
  const { name, description, status } = req.body;
  try {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    const updatedData = { name, description, status, updatedAt: new Date().toISOString() };
    await taskRef.update(updatedData);
    const updatedDoc = await taskRef.get();
    res.status(200).json({ id: taskRef.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error al actualizar la tarea:', error);
    res.status(500).json({ message: 'Error al actualizar la tarea' });
  }
};

exports.deleteTask = async (req, res) => {
  const taskId = req.params.taskId;
  try {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    await taskRef.delete();
    res.status(200).json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la tarea:', error);
    res.status(500).json({ message: 'Error al eliminar la tarea' });
  }
};

exports.getUsersByProjectId = async (req, res) => {
  const projectId = req.params.id;
  try {
    const projectUsersRef = db.collection('project_users');
    const snapshot = await projectUsersRef.where('project_id', '==', projectId).get();
    const userPromises = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      userPromises.push(db.collection('users').doc(data.user_id).get());
    });
    const userDocs = await Promise.all(userPromises);
    const users = userDocs.map(doc => {
      const data = doc.data();
      return { id: doc.id, username: data.username, email: data.email };
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

exports.assignUserToProject = async (req, res) => {
  const projectId = req.params.id;
  const { username } = req.body;
  try {
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('username', '==', username).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const userId = userSnapshot.docs[0].id;
    const projectUsersRef = db.collection('project_users');
    const existingAssignment = await projectUsersRef
      .where('project_id', '==', projectId)
      .where('user_id', '==', userId)
      .get();
    if (!existingAssignment.empty) {
      return res.status(409).json({ message: 'El usuario ya está asignado a este proyecto.' });
    }
    const assignmentData = { project_id: projectId, user_id: userId, assignedAt: new Date().toISOString() };
    const assignmentRef = await projectUsersRef.add(assignmentData);
    const newAssignment = await assignmentRef.get();
    res.status(201).json({ id: assignmentRef.id, ...newAssignment.data() });
  } catch (error) {
    console.error('Error al asignar el usuario al proyecto:', error);
    res.status(500).json({ message: 'Error al asignar el usuario al proyecto' });
  }
};

exports.removeUserFromProject = async (req, res) => {
  const projectId = req.params.projectId;
  const userId = req.params.userId;
  if (!projectId || !userId) {
    return res.status(400).json({ message: 'El projectId y el userId son obligatorios' });
  }
  try {
    const projectUsersRef = db.collection('project_users');
    const snapshot = await projectUsersRef
      .where('project_id', '==', projectId)
      .where('user_id', '==', userId)
      .get();
    if (snapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado en el proyecto' });
    }
    const deletePromises = [];
    snapshot.forEach(doc => {
      deletePromises.push(doc.ref.delete());
    });
    await Promise.all(deletePromises);
    res.status(200).json({ message: 'Usuario eliminado del proyecto exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el usuario del proyecto:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario del proyecto' });
  }
};

exports.getAssignedProjects = async (req, res) => {
  const username = req.query.username;
  if (!username) {
    return res.status(400).json({ message: 'El nombre de usuario es requerido' });
  }
  try {
    const usersRef = db.collection('users');
    const userSnapshot = await usersRef.where('username', '==', username).get();
    if (userSnapshot.empty) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const userId = userSnapshot.docs[0].id;
    const projectUsersRef = db.collection('project_users');
    const assignmentsSnapshot = await projectUsersRef.where('user_id', '==', userId).get();
    const projectPromises = [];
    assignmentsSnapshot.forEach(doc => {
      const data = doc.data();
      projectPromises.push(db.collection('projects').doc(data.project_id).get());
    });
    const projectDocs = await Promise.all(projectPromises);
    const projects = projectDocs
      .filter(doc => doc.exists)
      .map(doc => ({ id: doc.id, ...doc.data(), creator: doc.data().username }));
    res.status(200).json(projects);
  } catch (error) {
    console.error('Error al obtener los proyectos asignados:', error);
    res.status(500).json({ message: 'Error al obtener los proyectos asignados' });
  }
};

exports.assignTaskToUser = async (req, res) => {
  const { taskId, userId } = req.body; 
  if (!taskId || !userId) {
    return res.status(400).json({ message: 'El taskId y el userId son obligatorios' });
  }
  try {
    const taskRef = db.collection('tasks').doc(taskId);
    const taskDoc = await taskRef.get();
    if (!taskDoc.exists) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }
    await taskRef.update({ assigned_user_id: userId, assignedAt: new Date().toISOString() });
    const updatedDoc = await taskRef.get();
    res.status(200).json({ id: taskRef.id, ...updatedDoc.data() });
  } catch (error) {
    console.error('Error al asignar la tarea al usuario (BACKEND):', error);
    res.status(500).json({ message: 'Error al asignar la tarea al usuario' });
  }
};
