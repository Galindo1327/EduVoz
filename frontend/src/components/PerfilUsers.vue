<template>
    <!-- Enlace a Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <div class="container">
      <h1>PERFIL</h1>
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Datos del Usuario</h5>
          <p class="card-text"><strong>Nombre:</strong> {{ usuario.name }}</p>
          <p class="card-text"><strong>Correo:</strong> </p>
          <button @click="configurarPerfil" class="btn btn-primary">
            <i class="fas fa-cog"></i> Cambiar Contraseña
          </button>
          <button @click="cerrarSesion" class="btn btn-danger">
            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted} from 'vue';
  import { useRouter } from 'vue-router'; 

  const router = useRouter();
  const usuario = ref({
    name: ''
  });
  
  const obtenerDatosUsuario = async () => {
    const username = localStorage.getItem('username'); // Obtener el username de localStorage
  if (!username) {
    console.error('Username no encontrados en localStorage');
    return;
  }
  usuario.value = { username };

};
  
  const configurarPerfil = () => {
    console.log('Configuración del perfil');
  };
  
  const cerrarSesion = () => {
    localStorage.removeItem('username');
    console.log('Sesión cerrada');
    router.push('/login');
  };
  
  onMounted(() => {
    obtenerDatosUsuario();
  });
  </script>
  
  <style scoped>
  .container {
    padding: 20px;
  }
  
  .card {
    margin-top: 20px;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
  
  .card-text {
    font-size: 1.2rem;
  }
  
  .btn {
    margin-right: 10px;
    margin-top: 10px;
  }
  </style>