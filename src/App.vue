<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import LoginRegister from './views/LoginRegister.vue';
import HomeView from './views/HomeView.vue';
</script>

<template>
 <!-- <LoginRegister></LoginRegister> -->
 <!-- <HomeView></HomeView> -->

  <router-view ></router-view>
</template>
