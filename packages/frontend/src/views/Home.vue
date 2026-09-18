<script setup lang="ts">
import { onMounted } from 'vue';
import { getUserList, login } from '@/api/user';

onMounted(async () => {
  const data = await login({
    username: 'admin',
    password: '123456',
  });
  console.log('接口返回：', data);
});
</script>

<template>
  <div>
    <h1>Home</h1>
  </div>
</template>

<style></style>
