<template>
  <div class="admin-layout">
    <el-container>
      <el-aside width="200px">侧边栏</el-aside>
      <el-container>
        <el-header>头部</el-header>
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// 暂时为空
</script>