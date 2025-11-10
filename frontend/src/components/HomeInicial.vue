<template>
  <!-- Enlace a Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
  <div class="container">
    <h1>INICIO</h1>

    <div class="row">
      <!-- Reading Section -->
      <div class="col-md-12">
        <h2>Lecturas<button class="btn btn-success mt-3" @click="abrirFormulario">Añadir Lectura</button></h2> 
        
        <table class="table table-dark table-striped table-hover">
          <thead>
            <tr>
              <th>Nombre de la Lectura</th>
              <th>Descripción</th>
              <th>Fecha</th>
              <th>Archivo PDF</th>
              <th>🤖 IA</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody class="table-light text-dark">
            <tr v-for="(proyecto, index) in proyectos" :key="index">
              <td>{{ proyecto.name }}</td>
              <td>{{ proyecto.description }}</td>
              <td>{{ proyecto.date }}</td>
              <td>
                <span v-if="proyecto.pdfUrl">
                  <a :href="proyecto.pdfUrl" target="_blank" class="text-success text-decoration-none">
                    <i class="fas fa-file-pdf"></i> Ver PDF
                  </a>
                </span>
                <span v-else class="text-muted">Sin archivo</span>
              </td>
              <td>
                <button 
                  v-if="proyecto.pdfUrl" 
                  class="btn btn-info btn-sm" 
                  @click="abrirModalIA(proyecto)" 
                  title="Analizar con IA">
                  🤖 IA
                </button>
                <span v-else class="text-muted">-</span>
              </td>
              <td>
                <button class="btn btn-primary me-2" @click="abrirFormularioEdicion(proyecto)" title="Editar Lectura">
                  <i class="fas fa-edit"></i>
                </button>
                
                <button class="btn btn-secondary me-2" @click="gestionarProyecto(proyecto.id)" title="Gestionar Lectura">
                  <i class="fas fa-tasks"></i>
                </button>
                <button class="btn btn-danger" @click="confirmarEliminacion(proyecto.id)" title="Eliminar Lectura">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        
      </div>
    </div>

    <!-- Formulario de Añadir/Editar Lectura -->
    <div v-if="mostrarFormulario" class="modal">
      <div class="form-container">
        <h3>{{ editandoProyecto ? 'Editar Lectura' : 'Añadir Lectura' }}</h3>
        <form @submit.prevent="editandoProyecto ? guardarCambiosProyecto() : guardarProyecto()">
          <div class="form-group">
            <label for="nombre">Nombre de la Lectura:</label>
            <input type="text" v-model="nuevoProyecto.nombre" required />
          </div>
          <div class="form-group">
            <label for="descripcion">Descripción:</label>
            <textarea v-model="nuevoProyecto.descripcion" rows="3" required></textarea>
          </div>
          <div class="form-group">
            <label for="fecha">Fecha:</label>
            <input type="date" v-model="nuevoProyecto.fecha" required />
          </div>
          
          <!-- TODO: Campo para subir archivo PDF -->
          <div class="form-group">
            <label for="pdfFile">Archivo PDF (opcional):</label>
            <input 
              type="file" 
              id="pdfFile"
              ref="pdfFileInput"
              @change="handleFileUpload" 
              accept=".pdf"
              class="form-control-file"
            />
            <small class="form-text text-muted">
              Selecciona un archivo PDF para adjuntar a esta lectura
            </small>
            <div v-if="selectedFile" class="mt-2">
              <span class="badge bg-info">
                <i class="fas fa-file-pdf"></i> {{ selectedFile.name }}
              </span>
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn-save">{{ editandoProyecto ? 'Guardar Cambios' : 'Guardar' }}</button>
            <button type="button" class="btn-cancel" @click="cerrarFormulario">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
    <!-- <h2 class="mt-5">Proyectos Asignados</h2>
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
    </table> -->

    <!-- Modal de IA -->
    <div v-if="mostrarModalIA" class="modal">
      <div class="form-container-large">
        <h3>🤖 Analizar con IA: {{ proyectoSeleccionado?.name }}</h3>
        
        <div class="ai-section">
          <label for="userPrompt">¿Qué quieres que haga la IA con este PDF?</label>
          <textarea 
            id="userPrompt"
            v-model="promptUsuario" 
            rows="4" 
            placeholder="Ejemplo: Resume este documento en 5 puntos clave..."
            class="form-control mb-3"
            :disabled="procesandoIA"
          ></textarea>
          
          <div class="suggestions mb-3">
            <small class="text-muted">💡 Sugerencias de prompts:</small>
            <div class="suggestion-chips mt-2">
              <button 
                v-for="(sugerencia, idx) in sugerenciasPrompts" 
                :key="idx"
                @click="usarSugerencia(sugerencia)"
                class="chip-btn"
                :disabled="procesandoIA">
                {{ sugerencia }}
              </button>
            </div>
          </div>

          <div class="form-check mb-3">
            <input 
              type="checkbox" 
              v-model="generarAudio" 
              class="form-check-input" 
              id="generarAudio"
              :disabled="procesandoIA">
            <label class="form-check-label" for="generarAudio">
              🔊 Generar audio del resultado (TTS)
            </label>
          </div>

          <!-- Estado de procesamiento -->
          <div v-if="procesandoIA" class="alert alert-info">
            <div class="spinner-border spinner-border-sm me-2" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            {{ estadoProcesamiento }}
          </div>

          <!-- Resultado de IA -->
          <div v-if="respuestaIA" class="resultado-ia mt-3">
            <h5>📝 Respuesta de la IA:</h5>
            <div class="respuesta-contenido markdown-content" v-html="respuestaIAHTML">
            </div>
            
            <!-- Reproductor de audio -->
            <div v-if="audioUrl" class="audio-player mt-3">
              <h6>🔊 Audio generado:</h6>
              <audio controls :src="audioUrl" class="w-100">
                Tu navegador no soporta el elemento de audio.
              </audio>
              <a :href="audioUrl" download class="btn btn-sm btn-success mt-2">
                <i class="fas fa-download"></i> Descargar Audio
              </a>
            </div>
          </div>
        </div>

        <div class="form-actions mt-3">
          <button 
            type="button" 
            class="btn-save" 
            @click="procesarConIA"
            :disabled="procesandoIA || !promptUsuario.trim()">
            {{ procesandoIA ? 'Procesando...' : '🚀 Procesar con IA' }}
          </button>
          <button 
            type="button" 
            class="btn-cancel" 
            @click="cerrarModalIA"
            :disabled="procesandoIA">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { marked } from 'marked';

// Configurar marked para renderizar Markdown de forma segura
marked.setOptions({
  breaks: true, // Convertir saltos de línea en <br>
  gfm: true // Habilitar GitHub Flavored Markdown
});

const proyectos = ref([]);
const proyectosAsignados = ref([]);
const nuevoProyecto = ref({
  nombre: '',
  descripcion: '',
  fecha: ''
}); 
const selectedFile = ref(null); // Para almacenar el archivo PDF seleccionado
const editandoProyecto = ref(false);
const proyectoEditadoId = ref(null);
const mostrarFormulario = ref(false);
const pdfFileInput = ref(null); // Referencia al input de archivo
const router = useRouter();

// Variables para el modal de IA
const mostrarModalIA = ref(false);
const proyectoSeleccionado = ref(null);
const promptUsuario = ref('');
const generarAudio = ref(true);
const procesandoIA = ref(false);
const estadoProcesamiento = ref('');
const respuestaIA = ref('');
const audioUrl = ref('');

// Computed property para renderizar Markdown como HTML
const respuestaIAHTML = computed(() => {
  if (!respuestaIA.value) return '';
  return marked(respuestaIA.value);
});

// Sugerencias de prompts
const sugerenciasPrompts = ref([
  'Resume este documento en 5 puntos clave',
  'Extrae las conclusiones principales',
  'Genera 5 preguntas de estudio sobre este contenido',
  'Explícame esto de forma simple',
  'Crea un resumen ejecutivo breve'
]);

const abrirFormulario = () => { 
  mostrarFormulario.value = true; 
  editandoProyecto.value = false;
  nuevoProyecto.value = { nombre: '', descripcion: '', fecha: '' };
  selectedFile.value = null;
};

const abrirFormularioEdicion = (proyecto) => {
  mostrarFormulario.value = true;
  editandoProyecto.value = true;
  proyectoEditadoId.value = proyecto.id;
  nuevoProyecto.value = { nombre: proyecto.name, descripcion: proyecto.description, fecha: proyecto.date };
  selectedFile.value = null;
};

const cerrarFormulario = () => { 
  mostrarFormulario.value = false;
  selectedFile.value = null;
  if (pdfFileInput.value) {
    pdfFileInput.value.value = '';
  }
};

// Manejar la selección del archivo PDF
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'application/pdf') {
    selectedFile.value = file;
    console.log('Archivo PDF seleccionado:', file.name);
  } else {
    alert('Por favor, selecciona un archivo PDF válido');
    event.target.value = '';
    selectedFile.value = null;
  }
};

const guardarProyecto = async () => {
  try {
    let pdfUrl = null;

    // Si hay un archivo PDF seleccionado, subirlo primero
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append('pdf', selectedFile.value);

      const uploadResponse = await fetch('http://localhost:3000/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (uploadResponse.ok) {
        const uploadData = await uploadResponse.json();
        pdfUrl = uploadData.pdfUrl;
        console.log('✅ PDF subido exitosamente:', pdfUrl);
      } else {
        console.error('Error al subir el PDF');
        alert('Error al subir el archivo PDF');
        return;
      }
    }

    // Crear el proyecto con la URL del PDF (si existe)
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
        pdfUrl: pdfUrl,
      })
    });

    if (response.ok) {
      const data = await response.json();
      proyectos.value.push(data.project); 
      cerrarFormulario();
      nuevoProyecto.value = { nombre: '', descripcion: '', fecha: '' };
      alert('Lectura creada exitosamente' + (pdfUrl ? ' con archivo PDF' : ''));
    } else {
      console.error('Error al guardar la lectura');
      alert('Error al guardar la lectura');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
    alert('Error en la conexión al servidor');
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
  const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta lectura?');
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
      console.log('Lectura eliminada exitosamente');
      alert('Lectura eliminada exitosamente');
    } else {
      console.error('Error al eliminar la lectura');
      alert('Error al eliminar la lectura');
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
    alert('Error en la conexión al servidor');
  }
};

const gestionarProyecto = (id) => {
  router.push({ name: 'GestionarProyecto', params: { id } });
};

// ============= FUNCIONES DE IA =============

const abrirModalIA = (proyecto) => {
  proyectoSeleccionado.value = proyecto;
  promptUsuario.value = '';
  generarAudio.value = true;
  procesandoIA.value = false;
  respuestaIA.value = '';
  audioUrl.value = '';
  mostrarModalIA.value = true;
};

const cerrarModalIA = () => {
  mostrarModalIA.value = false;
  proyectoSeleccionado.value = null;
  promptUsuario.value = '';
  respuestaIA.value = '';
  audioUrl.value = '';
};

const usarSugerencia = (sugerencia) => {
  promptUsuario.value = sugerencia;
};

const procesarConIA = async () => {
  if (!promptUsuario.value.trim()) {
    alert('Por favor, escribe qué quieres que haga la IA');
    return;
  }

  procesandoIA.value = true;
  respuestaIA.value = '';
  audioUrl.value = '';
  estadoProcesamiento.value = '📄 Extrayendo texto del PDF...';

  try {
    const response = await fetch('http://localhost:3000/api/ai/process', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: proyectoSeleccionado.value.id,
        userPrompt: promptUsuario.value,
        generateAudio: generarAudio.value
      })
    });

    if (response.ok) {
      estadoProcesamiento.value = '🤖 Procesando con IA...';
      const data = await response.json();
      
      if (data.success) {
        respuestaIA.value = data.data.response;
        audioUrl.value = data.data.audioUrl || '';
        
        alert('✅ ¡Procesamiento completado!');
      } else {
        alert('Error: ' + data.message);
      }
    } else {
      const errorData = await response.json();
      alert('Error al procesar: ' + (errorData.message || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error en la conexión:', error);
    alert('Error en la conexión al servidor: ' + error.message);
  } finally {
    procesandoIA.value = false;
    estadoProcesamiento.value = '';
  }
};

// ============= FIN FUNCIONES DE IA =============

const obtenerProyectos = async () => {
  try {
    const username = localStorage.getItem('username');
    const response = await fetch(`http://localhost:3000/api/projects?username=${username}`);
    
    if (response.ok) {
      proyectos.value = await response.json();
    } else {
      console.error('Error al obtener las lecturas');
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
  max-height: 90vh;
  overflow-y: auto;
}

.form-container-large {
  background-color: #fff;
  padding: 25px;
  border-radius: 10px;
  width: 700px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.ai-section {
  margin-top: 15px;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip-btn {
  background-color: #e7f3ff;
  border: 1px solid #2196F3;
  color: #2196F3;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-btn:hover:not(:disabled) {
  background-color: #2196F3;
  color: white;
}

.chip-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.resultado-ia {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
}

.respuesta-contenido {
  background-color: white;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #28a745;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.6;
}

/* Estilos para el Markdown renderizado */
.markdown-content {
  font-size: 14px;
  color: #333;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin-top: 15px;
  margin-bottom: 10px;
  font-weight: bold;
  color: #2c3e50;
}

.markdown-content h1 {
  font-size: 24px;
  border-bottom: 2px solid #28a745;
  padding-bottom: 5px;
}

.markdown-content h2 {
  font-size: 20px;
}

.markdown-content h3 {
  font-size: 18px;
}

.markdown-content p {
  margin-bottom: 10px;
}

.markdown-content strong {
  font-weight: bold;
  color: #28a745;
}

.markdown-content em {
  font-style: italic;
  color: #555;
}

.markdown-content ul,
.markdown-content ol {
  margin-left: 20px;
  margin-bottom: 10px;
}

.markdown-content li {
  margin-bottom: 5px;
}

.markdown-content code {
  background-color: #f4f4f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #c7254e;
}

.markdown-content pre {
  background-color: #f4f4f4;
  padding: 10px;
  border-radius: 5px;
  overflow-x: auto;
  margin-bottom: 10px;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  color: #333;
}

.markdown-content blockquote {
  border-left: 4px solid #ddd;
  padding-left: 15px;
  margin: 10px 0;
  color: #666;
  font-style: italic;
}

.audio-player {
  background-color: #fff3cd;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ffc107;
}

.audio-player audio {
  margin-top: 10px;
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
input[type="date"],
textarea,
input[type="file"] {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

textarea {
  resize: vertical;
  font-family: inherit;
}

input[type="text"]:focus,
input[type="date"]:focus,
textarea:focus {
  border-color: #007bff;
  outline: none;
}

.form-control-file {
  padding: 5px;
  border: 2px dashed #ddd;
  background-color: #f8f9fa;
}

.form-control-file:hover {
  border-color: #007bff;
  background-color: #e9ecef;
}

.badge {
  padding: 8px 12px;
  font-size: 14px;
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