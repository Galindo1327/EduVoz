// src/routersdsd/indexd.js
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import RegisterView from '@/views/RegisterView.vue';
import HomeView from '@/views/HomeView.vue';
import WelcomeView from '@/views/WelcomeView.vue';
import GestionarProyecto from '@/views/GestionarProyecto.vue';
import PerfilView from '@/views/PerfilView.vue';



const routes = [
    {
      path: '/',
      redirect: '/login' 
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'Register',
      component: RegisterView
    },
    //#CREACION, ELIMINACION, AÑADIR, EDITAR PROYECTOS
    {
      path: '/home',
      name: 'HomeInicial',
      component: HomeView,
      //meta: { requiresAuth: true }
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: WelcomeView
    },
    {
      path: '/proyectos/:id',
      name: 'GestionarProyecto',
      component: GestionarProyecto
    },
    {
      path: '/profile',
      name: 'Perfil',
      component: PerfilView
    }
  ];
  
  const router = createRouter({
    history: createWebHistory(),
    routes
  });

  export default router;
  