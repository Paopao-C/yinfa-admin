<template>
  <el-container style="height: 100vh; overflow: hidden">
    <el-aside :width="isCollapse ? '64px' : '220px'" class="admin-aside" :class="{ 'is-collapse': isCollapse }">
      <div class="aside-header">
        <el-icon class="logo-icon"><House /></el-icon>
        <h3 v-show="!isCollapse">老友记管理</h3>
      </div>
      
      <el-menu
        router
        default-active="/admin/dashboard"
        class="admin-menu"
        background-color="#8B4513"
        text-color="#fff9e6"
        active-text-color="#ffffff"
        :collapse="isCollapse"
        :collapse-transition="true"
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><DataLine /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/admin/activities">
          <el-icon><Calendar /></el-icon>
          <span>活动管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/articles">
          <el-icon><Document /></el-icon>
          <span>文章管理</span>
        </el-menu-item>
        <!-- 后续添加其他菜单 -->
      </el-menu>
      <div class="collapse-btn" @click="toggleCollapse">
        <el-icon>
          <Fold v-if="!isCollapse" />
          <Expand v-else />
        </el-icon>
        <span v-show="!isCollapse" class="collapse-text">{{ isCollapse ? '展开' : '收起' }}</span>
      </div>
    </el-aside>
    <el-container class="admin-main-container">
      <el-header class="admin-header">
        <div class="header-content">
          <h2>老友记后台管理</h2>
          <div class="header-actions">
            <el-dropdown>
              <span class="user-info">
                <el-avatar
                  :size="32"
                  src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=elderly%20admin%20avatar%2C%20friendly%20face%2C%20simple%20style%2C%20high%20quality&image_size=square"
                />
                <span class="user-name">管理员</span>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>个人中心</el-dropdown-item>
                  <el-dropdown-item>退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </el-header>
      <el-main class="admin-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DataLine, House, Fold, Expand,Calendar,Document } from '@element-plus/icons-vue'

const isCollapse = ref(false)

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  overflow: hidden;
  background-color: #f5f2e8;
}

#app {
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.admin-aside {
  background-color: #654321;
  box-shadow: 2px 0 10px rgba(139, 69, 19, 0.3);
  overflow-y: auto;
  transition: width 0.3s ease;
  position: relative;
}

.aside-header {
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid rgba(255, 249, 230, 0.2);
  margin-bottom: 10px;
  justify-content: center;
}



.logo-icon {
  font-size: 24px;
  color: #fff9e6;
  margin-right: 10px;
}

.aside-header h3 {
  color: #fff9e6;
  font-size: 25px;
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
}

.collapse-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 0;
  cursor: pointer;
  color: #fff9e6;
  transition: all 0.3s ease;
  border-bottom: 1px solid rgba(255, 249, 230, 0.2);
}

.collapse-btn:hover {
  background-color: rgba(255, 249, 230, 0.1);
  color: #ffffff;
}

.collapse-btn .el-icon {
  font-size: 18px;
}


.admin-menu {
  border-right: none;
}

.admin-menu.el-menu--collapse {
  width: 64px;
}

.admin-menu.el-menu--collapse .el-menu-item {
  padding: 0 !important;
  justify-content: center;
}

.admin-main-container {
  background-color: #f5f2e8;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
  color: white;
  line-height: 60px;
  box-shadow: 0 2px 10px rgba(139, 69, 19, 0.2);
  padding: 0 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #fff9e6;
}

.header-actions {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-name {
  margin-left: 10px;
  color: #fff9e6;
  font-size: 14px;
}

.admin-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background-color: #f5f2e8;
}

/* 自定义滚动条 */
.admin-content::-webkit-scrollbar {
  width: 8px;
}

.admin-content::-webkit-scrollbar-track {
  background: #f5f2e8;
}

.admin-content::-webkit-scrollbar-thumb {
  background: #d2b48c;
  border-radius: 4px;
}

.admin-content::-webkit-scrollbar-thumb:hover {
  background: #cd853f;
}

/* 侧边栏滚动条 */
.admin-aside {
  overflow-y: auto;
}

.admin-aside::-webkit-scrollbar {
  width: 6px;
}

.admin-aside::-webkit-scrollbar-track {
  background: #8b4513;
}

.admin-aside::-webkit-scrollbar-thumb {
  background: #d2b48c;
  border-radius: 3px;
}

.admin-aside::-webkit-scrollbar-thumb:hover {
  background: #cd853f;
}
</style>
