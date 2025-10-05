<template>
  <div id="app">
   <!--<img alt="logo" src="./assets/logo.png" class="logo"/>-->
    <router-view />
  </div>
</template>

<style scoped>
#app {
  background-image: url('@/assets/background.jpg') !important;
  background-size: cover;
  background-position: center;
  min-height: 100vh;
}

.logo { 
  width: 100px;
  height: 100px;
  position: fixed;
  margin:0;
}

</style>