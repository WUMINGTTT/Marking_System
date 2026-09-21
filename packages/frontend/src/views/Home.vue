<script setup lang="ts">
import router from '@/router';
import { useUserStore } from '@/stores/user';
import { ref, reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import 'element-plus/dist/index.css';
import { createEvent } from '@/api/events';

const userStore = useUserStore();
const createVisible = ref(false);
const creating = ref(false);
// 个人中心对话框显示状态
const profileVisible = ref(false);
// 个人中心表单引用
const profileFormRef = ref();
// 创建活动表单引用
const createFormRef = ref();
// 创建活动表单数据
const createForm = reactive({
  name: '',
  description: '',
});
// 校验规则
const createRules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'change' },
    { max: 20, message: '活动名称长度不能超过20个字符', trigger: 'change' },
  ],
  description: [
    { required: true, message: '请输入活动描述', trigger: 'change' },
    { max: 200, message: '活动描述长度不能超过200个字符', trigger: 'change' },
  ],
};

// 退出登录执行函数
const logout = () => {
  ElMessageBox.confirm('确定退出登录吗？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    userStore.logout();
    router.replace('/login');
    ElMessage.success('退出登录成功');
  });
};

// 创建活动执行函数
const submitCreate = () => {
  createFormRef.value.validate((valid: boolean) => {
    if (!valid) {
      ElMessage.error('请填写完整信息');
      return;
    }
    creating.value = true;
    // 调用创建活动接口
    createEvent(createForm)
      .then(() => {
        ElMessage.success('创建活动成功');
        createVisible.value = false;
        createFormRef.value.resetFields();
        // 刷新活动列表
      })
      .catch(() => {
        ElMessage.error('创建活动失败');
      })
      .finally(() => {
        creating.value = false;
      });
    // 重置表单
  }, 1000);
};
</script>

<template>
  <el-container class="home">
    <el-header class="header" height="64px">
      <div class="title">评分系统-首页</div>
      <div class="actions">
        <!-- 创建活动按钮 -->
        <el-button type="primary" @click="createVisible = true"
          >创建活动</el-button
        >
        <!-- 创建活动对话框 -->
        <el-dialog
          v-model="createVisible"
          title="创建活动"
          width="420px"
          @closed="createFormRef?.resetFields()"
        >
          <el-form
            ref="createFormRef"
            :model="createForm"
            :rules="createRules"
            label-width="120px"
            label-position="top"
          >
            <el-form-item label="活动名称" prop="name">
              <el-input
                v-model="createForm.name"
                placeholder="请输入活动名称"
              />
            </el-form-item>
            <el-form-item label="活动描述" prop="description">
              <el-input
                v-model="createForm.description"
                placeholder="请输入活动描述"
              />
            </el-form-item>
          </el-form>
          <template #footer>
            <el-button @click="createVisible = false">取消</el-button>
            <el-button type="primary" :loading="creating" @click="submitCreate"
              >确定</el-button
            >
          </template>
        </el-dialog>
        <!-- 个人中心对话框 -->
        <el-dialog v-model="profileVisible" title="个人信息" width="360px">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名"
              >{{ userStore.userInfo?.username }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">{{
              userStore.userInfo?.name
            }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{
              userStore.userInfo?.createdAt
            }}</el-descriptions-item>
          </el-descriptions>
        </el-dialog>
        <!-- 个人中心下拉菜单 -->
        <el-dropdown>
          <span class="user">
            <el-avatar :size="37">
              {{ userStore.userInfo?.name?.[0] }}
            </el-avatar>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="profileVisible = true"
                >个人中心</el-dropdown-item
              >
              <el-dropdown-item>设置</el-dropdown-item>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>
    <el-main class="main"> <router-view /> </el-main>
  </el-container>
</template>

<style scoped lang="scss">
.home {
  height: 100vh;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
