<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Imagen del logo -->
      <img :src="logo" alt="Logo" class="logo" />
      <font color="white"><h2>Registro de usuarios</h2></font>
      <form @submit.prevent="register">
        
      <!-- #MENSAJE DE REGISTRO EXITOSO -->
        <div v-if="successMessage" class="alert alert-success">
        <p>{{ successMessage }}</p>
        <button @click="goToLogin" class="register-button">Volver al login</button>
      </div>

        <div class="input-group">
          <label>Nombre de usuario</label>
          <input v-model="username" type="text" placeholder="Nombre de usuario" required />
        </div>
        <div class="input-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="Contraseña" required />
        </div>
        <div class="input-group">
          <label>Confirmar contraseña</label>
          <input v-model="confirmPassword" type="password" placeholder="Confirmar contraseña" required />
        </div>
        <div class="input-group">
          <label>Correo electrónico</label>
          <input v-model="email" type="email" placeholder="Correo electrónico" required />
        </div>
        <div class="checkbox-container">
          <input v-model="acceptTerms" type="checkbox" id="acceptTerms" />
          <label for="acceptTerms">Acepto los términos y condiciones</label>
          <small>Debe aceptar los términos y condiciones para registrarse.</small>
        </div>

        <div class="button-container">
          <button type="submit" class="register-button" :disabled="!acceptTerms">Registrar</button>
          <button type="button" @click="goToLogin" class="register-button">Volver</button>
        </div>
      </form>

    </div>
  </div>
</template>

<script setup>
import useRegister from '@/composables/useRegister.js';
import logo from '@/assets/logo.png'; 
import { ref } from 'vue';

const { username, password, confirmPassword, email, successMessage, register, goToLogin} = useRegister();
const acceptTerms = ref(false);

console.log('Valor de acceptTerms:', acceptTerms.value);

</script>

<style>
body {
  background-image: url("~@/assets/background.jpg") !important;
  background-color: #f0f0f0 !important; /* Color de respaldo */
  background-repeat: no-repeat !important;
  background-position: center center !important;
  background-attachment: fixed !important;
  background-size: cover !important;
  height: 100vh;
  margin: 0;
  font-family: 'Arial', sans-serif;
}

.register-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.register-container {
  background: rgba(0, 0, 0, 0.7) !important;
  padding: 20px;
  border-radius: 10px;
  width: 350px;
  text-align: center;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
}

.logo {
  width: 80px;
  margin-bottom: 20px;
}
h2 {
  font-size: 2rem;
  color: aqua; /* Cambia este valor para ajustar el color del texto */
}

.input-group {
  margin-bottom: 15px;
  text-align: left;
}

.input-group label {
  color: #ffffff;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 5px;
  margin-top: 5px;
}

input:focus {
  outline: none;
  border: 2px solid #457b9d;
}

.checkbox-container {
  color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px 0;
}

.checkbox-container input {
  margin-right: 10px;
}

.checkbox-container small {
  margin-top: 5px;
  color: #aeaeae;
  font-size: 0.875rem;
}

.button-container {
  display: flex;
  justify-content: space-between; 
  margin-top: 20px; 
}

.register-button {
  background-color: #007BFF;
  color: #ffffff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 48%; 
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.register-button:hover {
  background-color: #0056b3;
  transform: scale(1.02); 
}

.register-button:active {
  transform: scale(0.98);
}

.register-button:disabled {
  background-color: #a8dadc;
  cursor: not-allowed;
}

.alert {
  background-color: #d4edda;
  color: #155724;
  padding: 10px;
  border-radius: 5px;
  margin-top: 20px;
}

.alert-success {
  background-color: #d4edda;
  color: #155724;
}

.alert button {
  margin-top: 10px;
  background-color: #007BFF;
  color: #ffffff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.alert button:hover {
  background-color: #0056b3;
  transform: scale(1.02); 
}

.alert button:active {
  transform: scale(0.98);
}

@media (max-width: 600px) {
  .register-container {
    padding: 20px;
    margin: 20px auto;
  }

  input,
  .register-button {
    font-size: 0.9rem;
    padding: 8px;
  }
}
</style>