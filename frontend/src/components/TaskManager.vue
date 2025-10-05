<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <div class="container">
    <h1>Gestión de Tareas</h1>
    <div v-if="proyecto">
      <h2>{{ proyecto.name }}</h2>
      <p>{{ proyecto.description }}</p>
      <p><strong>Fecha:</strong> {{ proyecto.date }}</p>

      <h3>Tareas</h3>
      <button @click="abrirModalTarea" class="btn btn-primary mb-3">Crear tarea</button>
      <table class="table table-dark table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre de la Tarea</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th>Asignado a</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody class="table-light text-dark">
          <tr v-for="(tarea, index) in tareas" :key="index">
            <td>{{ tarea.name }}</td>
            <td>{{ tarea.description }}</td>
            <td>
              <span :class="estadoClase(tarea.status)" class="estado-icono"></span>
              {{ tarea.status }}
            </td>
            <td>{{ tarea.assigned_user ? tarea.assigned_user.username : 'No asignado' }}</td>
            <td>
              <button @click="editarTarea(tarea)" class="btn btn-warning btn-sm">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="confirmarEliminarTarea(tarea.id)" class="btn btn-danger btn-sm">
                <i class="fas fa-trash-alt"></i>
              </button>
              <button @click="abrirModalAsignarTarea(tarea)" class="btn btn-info btn-sm">
                <i class="fas fa-user-plus"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Usuarios Asignados</h3>
      <table class="table table-dark table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre de Usuario</th>
            <th>Email</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody class="table-light text-dark">
          <tr v-for="(usuario, index) in usuarios" :key="index">
            <td>{{ usuario.username }}</td>
            <td>{{ usuario.email }}</td>
            <td>
              <button @click="eliminarUsuario(usuario.id)" class="btn btn-danger btn-sm">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <h3>Asignar Nuevo Usuario</h3>
      <button @click="abrirModalUsuario" class="btn btn-primary mb-3">Asignar Usuario</button>
      <div v-if="mensajeError" class="alert alert-danger mt-2">{{ mensajeError }}</div>
    </div>
    <div v-else>
      <p>Cargando datos del proyecto...</p>
    </div>

    <!-- Modal para Crear/Editar Tarea -->
    <div v-if="mostrarModalTarea" class="modal">
      <div class="modal-content">
        <span class="close" @click="cerrarModalTarea">&times;</span>
        <h3>{{ editandoTarea ? 'Editar Tarea' : 'Añadir Tarea' }}</h3>
        <form @submit.prevent="editandoTarea ? guardarCambiosTarea() : guardarTarea()">
          <div class="form-group">
            <label for="nombreTarea">Nombre de la Tarea:</label>
            <input type="text" v-model="nuevaTarea.name" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="descripcionTarea">Descripción:</label>
            <input type="text" v-model="nuevaTarea.description" class="form-control" required />
          </div>
          <div class="form-group">
            <label for="estadoTarea">Estado:</label>
            <select v-model="nuevaTarea.status" class="form-control" required>
              <option value="Asignado">Asignado</option>
              <option value="En proceso">En proceso</option>
              <option value="Finalizado">Finalizado</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ editandoTarea ? 'Guardar Cambios' : 'Guardar' }}</button>
            <button type="button" class="btn btn-secondary" @click="cerrarModalTarea">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para Asignar Usuario -->
    <div v-if="mostrarModalUsuario" class="modal">
      <div class="modal-content">
        <span class="close" @click="cerrarModalUsuario">&times;</span>
        <h3>Asignar Nuevo Usuario</h3>
        <form @submit.prevent="asignarUsuario">
          <div class="form-group">
            <label for="nombreUsuario">Nombre de Usuario</label>
            <input type="text" id="nombreUsuario" v-model="nuevoUsuario" class="form-control" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary mt-2">Asignar Usuario</button>
            <button type="button" class="btn btn-secondary" @click="cerrarModalUsuario">Cancelar</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal para Asignar Tarea a Usuario -->
    <div v-if="mostrarModalAsignarTarea" class="modal">
      <div class="modal-content">
        <span class="close" @click="cerrarModalAsignarTarea">&times;</span>
        <h3>Asignar Tarea a Usuario</h3>
        <form @submit.prevent="asignarTareaAUsuario">
          <div class="form-group">
            <label for="usuarioAsignado">Seleccionar Usuario</label>
            <select v-model="usuarioAsignado" class="form-control" required>
              <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
                {{ usuario.username }}
              </option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary mt-2">Asignar Tarea</button>
            <button type="button" class="btn btn-secondary" @click="cerrarModalAsignarTarea">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const proyecto = ref(null);
const tareas = ref([]);
const usuarios = ref([]);
const nuevaTarea = ref({
  name: '',
  description: '',
  status: 'Asignado'
});
const editandoTarea = ref(false);
const tareaEditandoId = ref(null);
const nuevoUsuario = ref('');
const mensajeError = ref('');
const projectId = ref(route.params.id);
const mostrarModalTarea = ref(false);
const mostrarModalUsuario = ref(false);
const mostrarModalAsignarTarea = ref(false);
const tareaSeleccionada = ref(null);
const usuarioAsignado = ref(null);

const obtenerProyecto = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/projects/${projectId.value}`);
    if (response.ok) {
      proyecto.value = await response.json();
      console.log('Proyecto:', proyecto.value);
    } else {
      console.error('Error al obtener el proyecto');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const obtenerTareas = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/projects/${projectId.value}/tasks`);
    if (response.ok) {
      tareas.value = await response.json();
      console.log('Tareas:', tareas.value);
    } else {
      console.error('Error al obtener las tareas');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const obtenerUsuarios = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/projects/${projectId.value}/users`);
    if (response.ok) {
      usuarios.value = await response.json();
      console.log('Usuarios:', usuarios.value);
    } else {
      console.error('Error al obtener los usuarios');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const asignarUsuario = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/projects/${projectId.value}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: nuevoUsuario.value })
    });
    if (response.ok) {
      await obtenerUsuarios();
      nuevoUsuario.value = '';
      mensajeError.value = '';
      mostrarModalUsuario.value = false;
      console.log('Usuario asignado');
    } else if (response.status === 409) {
      mensajeError.value = 'El usuario ya está asignado a este proyecto.';
    } else {
      console.error('Error al asignar el usuario');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const eliminarUsuario = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/projects/${projectId.value}/users/${userId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      await obtenerUsuarios();
      console.log('Usuario eliminado');
    } else {
      console.error('Error al eliminar el usuario');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const guardarTarea = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/projects/${projectId.value}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevaTarea.value)
    });
    if (response.ok) {
      await obtenerTareas();
      nuevaTarea.value = { name: '', description: '', status: 'Asignado' };
      mostrarModalTarea.value = false;
      console.log('Tarea guardada');
    } else {
      console.error('Error al guardar la tarea');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const editarTarea = (tarea) => {
  nuevaTarea.value = { ...tarea };
  tareaEditandoId.value = tarea.id;
  editandoTarea.value = true;
  mostrarModalTarea.value = true;
};

const guardarCambiosTarea = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${tareaEditandoId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nuevaTarea.value)
    });
    if (response.ok) {
      await obtenerTareas();
      nuevaTarea.value = { name: '', description: '', status: 'Asignado' };
      editandoTarea.value = false;
      tareaEditandoId.value = null;
      mostrarModalTarea.value = false;
      console.log('Tarea actualizada');
    } else {
      console.error('Error al actualizar la tarea');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const confirmarEliminarTarea = (taskId) => {
  if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
    eliminarTarea(taskId);
  }
};
const eliminarTarea = async (taskId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      await obtenerTareas();
      console.log('Tarea eliminada');
    } else {
      console.error('Error al eliminar la tarea');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

//};const cancelarEdicion = () => {
 //}; nuevaTarea.value = { name: '', description: '', status: 'Asignado' };
 //}; editandoTarea.value = false;
 //}; tareaEditandoId.value = null;
  //};mostrarModalTarea.value = false;
//};

const abrirModalTarea = () => {
  nuevaTarea.value = { name: '', description: '', status: 'Asignado' };
  editandoTarea.value = false;
  mostrarModalTarea.value = true;
};

const cerrarModalTarea = () => {
  mostrarModalTarea.value = false;
};

const abrirModalUsuario = () => {
  nuevoUsuario.value = '';
  mostrarModalUsuario.value = true;
};

const cerrarModalUsuario = () => {
  mostrarModalUsuario.value = false;
};

const abrirModalAsignarTarea = (tarea) => {
  tareaSeleccionada.value = tarea;
  usuarioAsignado.value = null;
  mostrarModalAsignarTarea.value = true;
};
const cerrarModalAsignarTarea = () => {
  mostrarModalAsignarTarea.value = false;
};

const asignarTareaAUsuario = async () => {
  try {
    // Verifica si los valores son correctos
    console.log('taskId:', tareaSeleccionada.value.id);
    console.log('userId:', usuarioAsignado.value);

    const response = await fetch('http://localhost:3000/api/tasks/assign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskId: tareaSeleccionada.value.id,
        userId: usuarioAsignado.value
      })
    });
    if (response.ok) {
      await obtenerTareas();
      mostrarModalAsignarTarea.value = false;
      console.log('Tarea asignada al usuario');
    } else {
      console.error('Error al asignar la tarea al usuario');
    }
  } catch (error) {
    console.error('Error en la conexión:',error);
}
};

const estadoClase = (estado) => {
  switch (estado) {
    case 'Asignado':
      return 'estado-asignado';
    case 'En proceso':
      return 'estado-en-proceso';
    case 'Finalizado':
      return 'estado-finalizado';
    default:
      return '';
  }
};

onMounted(() => {
  obtenerProyecto();
  obtenerTareas();
  obtenerUsuarios();
});
</script>

<style scoped>

h1,h2,h3,h4 {
  color: #FFFFFF; /* Cambia todos los títulos (h1, h2, h3, h4) a blanco */
}

p {
  color: #FFFFFF; /* Cambia el color de todos los párrafos a blanco */
}

.container {
  padding: 20px;
}

.table {
  margin-top: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-actions {
  margin-top: 10px;
}

.btn-save {
  margin-right: 10px;
}

.estado-icono {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.estado-asignado {
  background-color: blue;
}

.estado-en-proceso {
  background-color: orange;
}

.estado-finalizado {
  background-color: green;
}

/* Estilos para el modal */
.modal {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
  background-color: #fefefe;
  padding: 20px;
  border: 1px solid #888;
  width: 80%;
  max-width: 500px;
  border-radius: 10px;
}

.modal-content h1,.modal-content h2,.modal-content h3,.modal-content h4,.modal-content p,.modal-content label,.modal-content span {
  color: #000000; /* Cambia el texto en el modal a negro */
  text-shadow: none; /* Remueve el borde negro del texto en el modal */
}

.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
</style>