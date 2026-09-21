import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { UserInfo } from 'shared';
import { getUserInfo } from '@/api/user';

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null);

  // 获取当前用户信息
  async function getMy() {
    const res = await getUserInfo();
    userInfo.value = res.data;
  }

  // 退出登录，清空信息
  function logout() {
    userInfo.value = null;
    localStorage.removeItem('token');
  }

  return { userInfo, getMy, logout };
});
