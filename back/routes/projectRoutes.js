const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const multer = require('multer');

// Configurar Multer para manejar archivos en memoria
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // Límite de 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF'));
    }
  }
});

// Ruta para subir PDF
router.post('/upload-pdf', upload.single('pdf'), projectController.uploadPDF);

router.post('/projects', projectController.createProject);
router.get('/projects', projectController.getProjects);
router.delete('/projects/:id', projectController.deleteProject);
router.put('/projects/:id', projectController.updateProject);
router.get('/projects/:id', projectController.getProjectById);

// -------------------------------------------------------
// Rutas para tareas
router.get('/projects/:id/tasks', projectController.getTasksByProjectId);
router.post('/projects/:id/tasks', projectController.createTask);
router.delete('/tasks/:taskId', projectController.deleteTask);

// Ruta para obtener los usuarios asignados a un proyecto
router.get('/projects/:id/users', projectController.getUsersByProjectId);
// Ruta para asignar un usuario a un proyecto
router.post('/projects/:id/users', projectController.assignUserToProject)
// Ruta para eliminar un usuario de un proyecto
router.delete('/projects/:id/users/:userId', projectController.removeUserFromProject);

router.get('/assigned-projects', projectController.getAssignedProjects);
router.post('/tasks/assign', projectController.assignTaskToUser);



module.exports = router;