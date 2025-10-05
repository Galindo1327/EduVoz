<template>
  <div id="layout" class="d-flex vh-100">
    <!-- #SIDEBAR -->
    <aside id="sidebar" class="bg-primary d-flex flex-column justify-content-between" @mouseover="showNames" @mouseleave="hideNames">
      <div>
        <!-- #ICONO DE LOGO -->
        <div class="d-flex align-items-center justify-content-center py-4">
          <i class="bi bi-app-indicator text-white fs-2"></i>
        </div>

        <!-- #MENU -->
        <ul class="nav flex-column mt-4">
          <li class="nav-item" v-for="item in menuItems" :key="item.name" @click="navigateTo(item.route)">
            <a class="nav-link d-flex align-items-center justify-content-start text-white" href="#">
              <span class="icon pe-3">
                <i :class="item.icon"></i>
              </span>
              <span class="label transition-text" :class="{'collapsed': !isSidebarExpanded}">
                {{ item.name }}
              </span>
            </a>
          </li>
        </ul>
      </div>

      <!-- #LOGOUT BUTTON -->
      <div class="text-center mb-4 logout-btn-container">
        <button class="btn btn-danger w-100 d-flex align-items-center justify-content-center" @click="logout">
          <i class="bi bi-box-arrow-right"></i>
          <span class="ms-2 transition-text" :class="{'collapsed': !isSidebarExpanded}">Salir</span>
        </button>
      </div>
    </aside>

    <!-- #BARRA SUPERIOR Y CONTENIDO PRINCIPAL -->
    <main id="main-content" class="w-100 d-flex flex-column">
      <!-- #BARRA SUPERIOR -->
      <div class="topbar d-flex align-items-center justify-content-between p-3">
        <div class="d-flex align-items-center">
          <!-- #LOGO EN LA BARRA SUPERIOR -->
          <img :src="logo" alt="Logo" class="logo me-2" />
          <h2 class="text-success">GstWeb</h2>
        </div>
        <div class="d-flex align-items-center">
          <div class="search-bar me-3">
            <input type="text" class="form-control" placeholder="Buscar" />
          </div>
          <div class="user-profile d-flex align-items-center">
            <!-- #ICONO DE USUARIO -->
            <i class="bi bi-person-circle" style="font-size: 1.5rem;"></i>
            <span class="ms-2">{{ username }}</span>

            <button class="btn btn-link ms-3" @click="openSettings" title="Perfil y Configuracion">
              <i class="bi bi-gear-fill"></i>
            </button>
            <button class="btn btn-danger ms-3" @click="logout">
              <i class="bi bi-box-arrow-left"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- #CONTENIDO PRINCIPAL -->
      <div id="content" class="flex-grow-1">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import logo from '@/assets/logo.png'; 

const isSidebarExpanded = ref(false);
const router = useRouter();

const username = ref('');

onMounted(() => {
  username.value = localStorage.getItem('username');
});

// #ITEMS BARRA LATERAL
const menuItems = ref([
  { name: 'Inicio', icon: 'bi bi-grid', route: '/welcome' },
  { name: 'Proyectos', icon: 'bi bi-app', route: '/home' },
  { name: 'Perfil', icon: 'bi bi-person', route: '/profile' },
]);

const showNames = () => {
  isSidebarExpanded.value = true;
};

const hideNames = () => {
  isSidebarExpanded.value = false;
};

// #RUTAS MENU LATERAL
const navigateTo = (route) => {
  router.push(route);
};

const openSettings = () => {
  router.push('/profile');
};

// #CIERRE DE SESION
const logout = () => {
  localStorage.removeItem('username');
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
  console.log('Sesión cerrada');
  router.push('/login');
};
</script>

<style scoped>
/* #LAYOUT */
#layout {
  display: flex;
  min-height: 100vh;
}

/* #SIDEBAR */
#sidebar {
  width: 60px;
  min-height: 100vh;
  transition: width 0.4s ease;
  background-color: #007bff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
}

#sidebar:hover {
  width: 200px;
}

.icon {
  font-size: 24px;
  min-width: 24px;
  text-align: center;
}

/* #BOTON DE LOGOUT AL FINAL */
.logout-btn-container {
  margin-top: auto;
}

.nav-link {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s ease;
  border-radius: 5px;
  background-color: #0056b3;
  margin: 0;
}

.nav-item {
  margin-bottom: 2px;
}

.nav-link:hover {
  background-color: #004494;
}

.transition-text {
  opacity: 1;
  visibility: visible;
  transition: opacity 0.3s ease, visibility 0.3s ease;
}

.transition-text.collapsed {
  opacity: 0;
  visibility: hidden;
}

/* MAIN CONTENT */
#main-content {
  flex-grow: 1;
  min-height: 100vh;
  overflow-y: auto;
  background-image: url('@/assets/backgroundglobal.jpg');
  background-size: cover;
  background-position: center;
}

.topbar {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.search-bar input {
  border-radius: 20px;
  border: 1px solid #ddd;
  padding: 5px 15px;
}

.user-profile img {
  width: 40px;
  height: 40px;
}

.logo {
  width: 60px;
  height: auto;
}

#content {
  padding: 20px;
}

/* #FLEXIBILIDAD SIDEBAR ADAPTABLE */
.d-flex.vh-100 {
  height: 100vh;
}

/* #RESPONSIVE */
@media (max-width: 768px) {
  #sidebar {
    width: 50px;
  }

  #sidebar:hover {
    width: 150px;
  }

  .icon {
    font-size: 20px;
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .user-profile {
    margin-top: 10px;
  }
}

.logo {
  width: 60px; 
  height: auto;
}
</style>