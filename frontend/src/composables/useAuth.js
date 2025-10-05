// src/composables/useAuth.js
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export default function useAuth() {
  const username = ref(localStorage.getItem('username') || '');
  const password = ref('');
  const errorMessage = ref('');
  const loading = ref(false);
  const router = useRouter();

  const login = async () => {
    //#Validacion de entrada 
    if (!username.value || !password.value) {
      errorMessage.value = 'Por favor, completa todos los campos.';
      return;
    }
    
    errorMessage.value = ''; 
    loading.value = true; 

    try {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.value, password: password.value}),
      });

      if (response.ok) {

        localStorage.setItem('username', username.value);
        
        username.value = '';
        password.value = '';

        router.push('/welcome');
      } else {
        const { message } = await response.json();
        errorMessage.value = message || 'Credenciales incorrectas';
      }
    } catch (error) {
      errorMessage.value = 'Error en la conexión. Inténtalo de nuevo.';
    } finally {
      loading.value = false; //#Estado de Carga - OFF
    }
  };

  return {
    username,
    password,
    errorMessage,
    loading,
    login,
  };
}
