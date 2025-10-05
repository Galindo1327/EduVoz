// src/composables/useRegister.js
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default function useRegister() {
  const username = ref('');
  const password = ref('');
  const confirmPassword = ref('');
  const email = ref('');
  const acceptTerms = ref(false);
  const successMessage = ref('');
  const errorMessage = ref('');
  
  const router = useRouter();

  const register = async () => {
    if (password.value !== confirmPassword.value) {
      alert('Las contraseñas no coinciden');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/register', {
        username: username.value,
        password: password.value,
        confirmPassword: confirmPassword.value,
        email: email.value,
        acceptTerms: acceptTerms.value ? 0 : 1
      });

      if (response.status === 201) {
        successMessage.value = 'Tu cuenta ha sido registrada exitosamente.';
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {

        const errorMessage = error.response.data.message;
        console.error('Error al registrar:', error.response ? error.response.data : error);

        if (errorMessage === 'El usuario ya existe') {
          alert('El nombre de usuario ya está registrado. Intenta con otro.');
        } else if (errorMessage === 'El correo ya está registrado') {
          alert('El correo electrónico ya está registrado. Intenta con otro.');
        }
      } else {
        alert('Error al registrar el usuario: ' + (error.response ? error.response.data : error.message));
      }
    }
  };
  const goToLogin = () => {
    router.push('/login');
  };

  return {
    username,
    password,
    confirmPassword,
    email,
    acceptTerms,
    successMessage,
    errorMessage,
    register,
    goToLogin,
  };
}