<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Imagen del logo -->
      <img :src="logo" alt="Logo" class="logo" />
      
      <h2>INICIAR SESIÓN</h2>
      <form @submit.prevent="login">
        <div class="input-group">
          <label>Usuario</label>
          <input v-model="username" type="text" required placeholder="Nombre de usuario" />
        </div>
        <div class="input-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" required placeholder="Contraseña" />
        </div>
        <button type="submit" class="login-button">Entrar</button>
      </form>

      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

      <p class="register-link">No tienes una cuenta? <router-link to="/register">Regístrate aquí</router-link></p>
    </div>
  </div>
</template>


<script setup>
import useAuth from '@/composables/useAuth.js';
import logo from '@/assets/logo.png';

const { username, password, errorMessage, login } = useAuth();

username.value = '';
password.value = '';
</script>

<style scoped>  
.login-page {
  background-image: url("~@/assets/background.jpg") !important;
  background-color: #f0f0f0 !important; /* Color de respaldo */
  background-repeat: no-repeat !important;
  background-position: center center !important;
  background-attachment: fixed !important;
  background-size: cover !important;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.login-container {
  background: rgba(0, 0, 0, 0.7) !important;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  text-align: center;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

.logo {
  width: 80px;
  margin-bottom: 20px;
}

h2 {
  color: #ffffff;
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  margin-bottom: 20px;
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

.input-group label {
  color: #ffffff;
  font-size: 14px;
}

.input-group input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin-top: 5px;
}

.login-button {
  background-color: #007BFF;
  color: #ffffff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
}

.login-button:hover {
  background-color: #0056b3;
}

.register-link {
  color: #ffffff;
  font-size: 14px;
  margin-top: 20px;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>