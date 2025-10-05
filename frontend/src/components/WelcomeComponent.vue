<template>
  <div class="welcome-container">
    <div class="header">
      <h1>Bienvenido a GstWeb</h1>
      <p>Tu gestor de proyectos eficiente y fácil de usar.</p>
    </div>
    <div class="content">
      <div class="intro">
        <h2>¿Qué es un Gestor de Proyectos?</h2>
        <p>
          Un gestor de proyectos es una herramienta que te ayuda a planificar, organizar y gestionar tus proyectos de manera eficiente. Con GstWeb, puedes crear proyectos, asignar tareas, colaborar con tu equipo y hacer un seguimiento del progreso de tus proyectos en tiempo real.
        </p>
        <button @click="irACrearProyecto" class="btn btn-primary">Crear Proyecto</button>
      </div>
      <div class="row mt-4">
        <div class="col-md-6">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h3 class="card-title">Colaboración en Equipo</h3>
              <p class="card-text">
                Facilita la colaboración entre los miembros de tu equipo, permitiéndoles trabajar juntos en tareas y proyectos, compartir archivos y comunicarse de manera efectiva.
              </p>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h3 class="card-title">Seguimiento del Progreso</h3>
              <p class="card-text">
                Mantén un registro del progreso de tus proyectos con herramientas de seguimiento y reportes detallados. Identifica cuellos de botella y asegúrate de que todo esté en marcha.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const irACrearProyecto = () => {
  router.push('/home');
};
</script>

<style scoped>
.welcome-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
  color: #f8f9fa;
  background-color: rgba(0, 0, 0, 0.7);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.header {
  margin-bottom: 40px;
}

.header h1 {
  font-size: 2.5rem;
  color: #ffffff;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.8);
}

.header p {
  font-size: 1.2rem;
  color: #d1d1d1;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.intro {
  margin-bottom: 40px;
}

.intro h2 {
  font-size: 2rem;
  color: #1abc9c;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.7);
}

.intro p {
  font-size: 1rem;
  color: #e0e0e0;
  margin-bottom: 20px;
}
.card-title {
  font-size: 1.5rem;
  color: #000000; /* Color negro */
}

.card-text {
  font-size: 1rem;
  color: #000000;
}
</style>