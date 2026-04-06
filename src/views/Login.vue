<template>
  <div class="login-container">
    <div class="login-bg"></div>
    <el-card class="login-card">
      <div class="login-header">
        <div class="logo">
          <el-icon class="logo-icon"><User /></el-icon>
        </div>
        <h2>老友记后台管理</h2>
        <p class="login-desc">欢迎管理员登录</p>
      </div>
      <el-form :model="form" :rules="rules" ref="loginFormRef" class="login-form">
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" class="input-item">
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="form.password"
            placeholder="请输入密码"
            class="input-item"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item class="login-button">
          <el-button type="primary" @click="handleLogin" :loading="loading" class="btn-login"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <p>© 2026 老友记 - 关爱老年人健康生活</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElIcon } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const form = reactive({ username: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请填写用户名和密码')
    return
  }
  loading.value = true
  try {
    const res = await axios.post('/api/admin/login', {
      account: form.username, // 这里 username 可以是手机号或昵称
      password: form.password,
    })
    localStorage.setItem('adminToken', res.data.token)
    localStorage.setItem('adminInfo', JSON.stringify(res.data.admin))
    ElMessage.success('登录成功')
    router.push('/admin')
  } catch (err: any) {
    ElMessage.error(err.response?.data?.error || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('../assets/images/image.png');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.login-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.login-card {
  width: 420px;
  background: rgba(255, 255, 255, 0.48);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 30px;
  z-index: 2;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: none;
}

.login-card:hover {
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  transform: translateY(-5px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.logo-icon {
  font-size: 70px;
  color: #667eea;
  background: #f0f2ff;
  padding: 20px;
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.login-header h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.login-desc {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.login-form {
  width: 100%;
}

.input-item {
  border-radius: 8px;
  height: 48px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.input-item:focus {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.login-button {
  margin-top: 20px;
}

.btn-login {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  background: linear-gradient(135deg, #409eff 0%, #667eea 100%); /* 更柔和的蓝紫渐变 */
  border: none;
  transition: all 0.3s ease;
}

.btn-login:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-login:active {
  transform: translateY(0);
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.login-footer p {
  margin: 0;
  font-size: 12px;
  color: #ffffffab;
}

@media (max-width: 768px) {
  .login-card {
    width: 90%;
    max-width: 400px;
    padding: 20px;
  }
}
</style>
