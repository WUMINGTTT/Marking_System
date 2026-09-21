<script setup lang="ts">
import { reactive, ref } from 'vue';
import { User, Lock, CircleCheck, View } from '@element-plus/icons-vue';
const showLogin = ref(true);
import { ElMessage, type FormInstance } from 'element-plus';
import 'element-plus/dist/index.css';
import { login, register } from '@/api/user';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const userStore = useUserStore();

const loginFormRef = ref<FormInstance>();
const registerFormRef = ref<FormInstance>();

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: '',
});

// 注册表单数据
const registerForm = reactive({
  name: '',
  username: '',
  password: '',
  confirmPassword: '',
});

// 登录函数
const loginFn = async () => {
  try {
    await loginFormRef.value?.validate();
  } catch (error) {
    ElMessage.error('请填写完整登录信息');
    return;
  }
  // 发登录请求
  try {
    const res = await login(loginForm);
    // 登录成功后，将 token 存储到 localStorage 中
    localStorage.setItem('token', res.data.token);
    // 登录成功后，将用户信息保存到 store 中
    ElMessage.success(`登录成功，欢迎 ${res.data.name} `);
    // 清空表单数据
    loginFormRef.value?.resetFields();
    // 跳转到首页
    router.replace({ name: 'home' });
  } catch (error: any) {
    // 登录失败，显示错误信息(从响应信息中拆出错误信息)
    ElMessage.error(error.response.data.message);
  }
};

// 注册函数
const registerFn = async () => {
  try {
    await registerFormRef.value?.validate();
  } catch (error) {
    ElMessage.error('请填写完整注册信息');
    return;
  }
  // 发注册请求
  try {
    const res = await register(registerForm);
    ElMessage.success(`注册成功，请登录 `);
    // 注册成功后，跳转到登录表单
    switchover();
  } catch (error: any) {
    ElMessage.error(error.response.data.message);
  }
};

// 确认密码验证规则
const confirmPasswordRules = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请确认密码'));
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'));
  } else {
    callback();
  }
};

const rules = {
  name: [
    { required: true, message: '请输入昵称', trigger: 'change' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' },
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'change' },
    { min: 4, max: 10, message: '长度在 4 到 10 个字符', trigger: 'change' },
    {
      pattern: /^[a-zA-Z0-9]+$/,
      message: '只能包含字母和数字',
      trigger: 'change',
    },
  ],
  // >= 6 个字符
  password: [
    { required: true, message: '请输入密码', trigger: 'change' },
    { min: 6, message: '长度至少 6 个字符', trigger: 'change' },
  ],
  confirmPassword: [{ validator: confirmPasswordRules, trigger: 'change' }],
};

// 切换登录注册表单
const switchover = () => {
  showLogin.value = !showLogin.value;
  // 重置表单
  loginFormRef.value?.resetFields();
  registerFormRef.value?.resetFields();
};
</script>

<template>
  <div class="box">
    <!-- 登录表单 -->
    <el-form
      v-if="showLogin"
      ref="loginFormRef"
      class="card"
      :model="loginForm"
      :rules="rules"
    >
      <div class="title">欢迎回来</div>
      <div class="sub-title">请输入您的账号信息</div>
      <el-form-item prop="username">
        <el-input
          :prefix-icon="User"
          class="input"
          clearable
          v-model="loginForm.username"
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          class="input"
          :prefix-icon="Lock"
          v-model="loginForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button class="btn" type="primary" @click="loginFn">登录</el-button>
      </el-form-item>
      <div class="hint">
        还没有账号？<span @click="switchover">立即注册</span>
      </div>
    </el-form>

    <!-- 注册表单 -->
    <el-form
      v-else
      ref="registerFormRef"
      class="card"
      :model="registerForm"
      :rules="rules"
    >
      <div class="title">欢迎使用</div>
      <div class="sub-title">请创建您的账号</div>
      <el-form-item prop="name">
        <el-input
          class="input"
          clearable
          :prefix-icon="View"
          v-model="registerForm.name"
          placeholder="请输入昵称"
        />
      </el-form-item>
      <el-form-item prop="username">
        <el-input
          class="input"
          clearable
          :prefix-icon="User"
          v-model="registerForm.username"
          placeholder="请输入用户名"
        />
      </el-form-item>
      <el-form-item prop="password">
        <el-input
          class="input"
          :prefix-icon="Lock"
          v-model="registerForm.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>
      <el-form-item prop="confirmPassword">
        <el-input
          class="input"
          :prefix-icon="CircleCheck"
          v-model="registerForm.confirmPassword"
          type="password"
          placeholder="确认密码"
          show-password
        />
      </el-form-item>
      <el-form-item>
        <el-button class="btn" type="primary" @click="registerFn"
          >注册</el-button
        >
      </el-form-item>
      <div class="hint">已有账号？<span @click="switchover">登录</span></div>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
.box {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
}
.card {
  width: 100%;
  max-width: 450px;
  padding: 45px 40px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.08);

  .title {
    font-size: 30px;
    font-weight: 600;
    color: black;
  }

  .sub-title {
    margin: 20px 0 30px;
    font-size: 16px;
    color: #9f9f9f;
  }

  .input {
    height: 50px;
    --el-input-bg-color: #f9f9f9;
  }

  .input :deep(.el-input__wrapper) {
    border-radius: 10px; /* 在这里设置你想要的圆角大小 */
  }

  .btn {
    width: 100%;
    height: 50px;
    margin-top: 10px;
    font-size: 16px;
    border-radius: 10px;
  }

  .hint {
    font-size: 14px;
    color: #9f9f9f;

    span {
      color: #409eff;
      cursor: pointer;
    }
  }
}
</style>
