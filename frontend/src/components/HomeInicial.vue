<template>
  <!-- Enlace a Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <div class="container">
    <h1>INICIO</h1>

    <div class="row">
      <!-- Projects Section -->
      <div class="col-md-12">
        <h2>Proyectos <button class="btn btn-success mt-3" @click="abrirFormulario">Añadir Proyecto</button></h2> 
        
        <table class="table table-dark table-striped table-hover">
          
          <thead>
            <tr>
              <th>Nombre del Proyecto</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody class="table-light text-dark">
            <tr v-for="(proyecto, index) in proyectos" :key="index">
              <td>{{ proyecto.name }}</td>
              <td>{{ proyecto.description }}</td>
              <td>{{ proyecto.date }}</td>
              <td>
                <button class="btn btn-primary me-2" @click="abrirFormularioEdicion(proyecto)" title="Editar Proyecto">
                  <i class="fas fa-edit"></i>
                </button>
                
                <button class="btn btn-secondary me-2" @click="gestionarProyecto(proyecto.id)" title="Gestionar Proyecto">
                  <i class="fas fa-tasks"></i>
                </button>
                <button class="btn btn-danger" @click="confirmarEliminacion(proyecto.id)" title="Eliminar Proyecto">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    </div>

    <!-- Formulario de Añadir/Editar Proyecto -->
    <div v-if="mostrarFormulario" class="modal">
      <div class="form-container">
        <h3>{{ editandoProyecto ? 'Editar Proyecto' : 'Añadir Proyecto' }}</h3>
        <form @submit.prevent="editandoProyecto ? guardarCambiosProyecto() : guardarProyecto()">
          <div class="form-group">
            <label for="nombre">Nombre del Proyecto:</label>
            <input type="text" v-model="nuevoProyecto.nombre" required />
          </div>
          <div class="form-group">
            <label for="descripcion">Descripción:</label>
            <input type="text" v-model="nuevoProyecto.descripcion" required />
          </div>
          <div class="form-group">
            <label for="fecha">Fecha:</label>
            <input type="date" v-model="nuevoProyecto.fecha" required />
          </div>
          <div class="form-group">
            <label for="newdate">Nuevo campo:</label>
            <input type="text" v-model="nuevoProyecto.newdate" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="btn-save">{{ editandoProyecto ? 'Guardar Cambios' : 'Guardar' }}</button>
            <button type="button" class="btn-cancel" @click="cerrarFormulario">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
    <h2 class="mt-5">Proyectos Asignados</h2>
    <table class="table table-dark table-striped table-hover">
      <thead>
        <tr>
          <th>Nombre del Proyecto</th>
          <th>Descripción</th>
          <th>Fecha</th>
          <th>Creador</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody class="table-light text-dark">
        <tr v-for="(proyecto, index) in proyectosAsignados" :key="index">
          <td>{{ proyecto.name }}</td>
          <td>{{ proyecto.description }}</td>
          <td>{{ proyecto.date }}</td>
          <td>{{ proyecto.creator }}</td>
          <td>
            <button class="btn btn-secondary me-2" @click="gestionarProyecto(proyecto.id)" title="Gestionar Proyecto">
              <i class="fas fa-tasks"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const proyectos = ref([]);
const proyectosAsignados = ref([]);
const nuevoProyecto = ref({
  nombre: '',
  descripcion: '',
  fecha: '',
  newdate: ''
}); 
const editandoProyecto = ref(false);
const proyectoEditadoId = ref(null);
const mostrarFormulario = ref(false);
const router = useRouter();

const abrirFormulario = () => { 
  mostrarFormulario.value = true; 
  editandoProyecto.value = false;
  nuevoProyecto.value = { nombre: '', descripcion: '', fecha: '' };
};

const abrirFormularioEdicion = (proyecto) => {
  mostrarFormulario.value = true;
  editandoProyecto.value = true;
  proyectoEditadoId.value = proyecto.id;
  nuevoProyecto.value = { nombre: proyecto.name, descripcion: proyecto.description, fecha: proyecto.date };
};

const cerrarFormulario = () => { 
  mostrarFormulario.value = false; 
};

const guardarProyecto = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: localStorage.getItem('username'),
        name: nuevoProyecto.value.nombre,
        description: nuevoProyecto.value.descripcion,
        date: nuevoProyecto.value.fecha,
        newdate: nuevoProyecto.value.newdate,
      })
    });

    if (response.ok) {
      const data = await response.json();
      proyectos.value.push(data.project); 
      cerrarFormulario();
      nuevoProyecto.value = { nombre: '', descripcion: '', fecha: '', newdate: '' };
    } else {
      console.error('Error al guardar el proyecto');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const guardarCambiosProyecto = async () => {
  try {
    const response = await fetch(`http://localhost:3000/api/projects/${proyectoEditadoId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: localStorage.getItem('username'),
        name: nuevoProyecto.value.nombre,
        description: nuevoProyecto.value.descripcion,
        date: nuevoProyecto.value.fecha,
      })
    });

    if (response.ok) {
      const data = await response.json();
      const index = proyectos.value.findIndex(proyecto => proyecto.id === proyectoEditadoId.value);
      proyectos.value[index] = data.project;
      cerrarFormulario();
      nuevoProyecto.value = { nombre: '', descripcion: '', fecha: '' };
    } else {
      console.error('Error al guardar los cambios del proyecto');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};


const confirmarEliminacion = (id) => {
  const confirmacion = confirm('¿Estás seguro de que deseas eliminar este proyecto?');
  if (confirmacion) {
    eliminarProyecto(id);
  }
};


const eliminarProyecto = async (id) => {
  try {
    const username = localStorage.getItem('username');
    const response = await fetch(`http://localhost:3000/api/projects/${id}?username=${username}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      proyectos.value = proyectos.value.filter(proyecto => proyecto.id !== id);
      console.log('Proyecto eliminado exitosamente');
    } else {
      console.error('Error al eliminar el proyecto');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const gestionarProyecto = (id) => {
  router.push({ name: 'GestionarProyecto', params: { id } });
};

const obtenerProyectos = async () => {
  try {
    const username = localStorage.getItem('username');
    const response = await fetch(`http://localhost:3000/api/projects?username=${username}`);
    
    if (response.ok) {
      proyectos.value = await response.json();
    } else {
      console.error('Error al obtener los proyectos');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

const obtenerProyectosAsignados = async () => {
  try {
    const username = localStorage.getItem('username');
    const response = await fetch(`http://localhost:3000/api/assigned-projects?username=${username}`);
    if (response.ok) {
      proyectosAsignados.value = await response.json();
      console.log('Proyectos Asignados:', proyectosAsignados.value);
    } else {
      console.error('Error al obtener los proyectos asignados');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
  }
};

onMounted(() => {
  obtenerProyectos();
  obtenerProyectosAsignados();
});
</script>

<style scoped>
h1, h2 {
  color: #FFFFFF;
}

.modal {
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

form {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.form-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h3 {
  text-align: center;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: #555;
}

input[type="text"],
input[type="date"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="date"]:focus {
  border-color: #007bff;
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: space-between;
}
.btn{
  background-color: #007bff;
}
.btn-save {
  background-color: #24d54d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-cancel {
  background-color: #dc3545;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

button:hover {
  opacity:0.9;
}
</style>