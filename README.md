# 📚 EduVoz - Sistema de Gestión de Lecturas

## 🔄 Migración Completada: PostgreSQL → Firebase

### ✅ Cambios Realizados

**Backend:**
- ✅ Eliminado PostgreSQL completamente
- ✅ Implementado Firebase Firestore para base de datos
- ✅ Implementado Firebase Storage (preparado para PDFs)
- ✅ Todos los controladores actualizados

**Frontend:**
- ✅ "Proyectos" renombrado a "Lecturas"
- ✅ Formulario preparado para subir archivos PDF
- ✅ Interfaz mejorada con indicadores de archivos

---

## 🚀 Inicio Rápido

### 1. Configurar Firebase (IMPORTANTE)

Pasos resumidos:
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Activar Firestore Database
3. Activar Firebase Storage
4. Descargar `serviceAccountKey.json`
5. Colocarlo en `back/config/serviceAccountKey.json`
6. Actualizar `back/config/db.js` con tu bucket de Storage

### 2. Instalar Dependencias

```bash
# Backend
cd back
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Iniciar la Aplicación

```bash
# Terminal 1: Backend
cd back
npm run dev

# Terminal 2: Frontend
cd frontend
npm run serve
```

---

## 📂 Estructura de Firebase

### Colecciones en Firestore:
- `users` - Usuarios del sistema
- `projects` - Lecturas creadas
- `tasks` - Tareas asociadas a lecturas
- `project_users` - Relación usuarios-proyectos

### Storage:
- `readings/` - Carpeta para PDFs de lecturas

---

## 🎯 Estado Actual

### ✅ Completado:
- Migración completa a Firebase
- CRUD de lecturas con Firestore
- Autenticación adaptada a Firebase
- Interfaz actualizada

### 🚧 Pendiente (Para próxima fase):
- Implementar subida real de archivos PDF
- Implementar descarga de PDFs
- Conectar Firebase Authentication (opcional)

---

## 📝 Notas Importantes

⚠️ **NUNCA subas `serviceAccountKey.json` a GitHub** - Ya está en `.gitignore`

⚠️ **Las reglas de Firestore están en modo desarrollo** - Cambiar antes de producción

---

## 🔧 Comandos Útiles

```bash
# Instalar dependencias del backend
cd back && npm install

# Ejecutar backend en modo desarrollo
cd back && npm run dev

# Ejecutar frontend
cd frontend && npm run serve

# Build para producción (frontend)
cd frontend && npm run build
```

---

## 📞 Próximos Pasos

1. **Configurar Firebase**
2. **Probar la aplicación** con Firebase
3. **Implementar subida de PDFs** (código preparado, solo activar)

---

¡Disfruta de EduVoz con Firebase! 🎉
