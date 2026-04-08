<template>
  <div class="users">
    <el-card>
      <div class="header">
        <h2>用户管理</h2>
      </div>
      <div class="filters">
        <el-input
          v-model="keyword"
          placeholder="搜索昵称/手机号"
          clearable
          style="width: 250px; margin-right: 10px"
          @clear="fetchList"
          @keyup.enter="fetchList"
        />
        <el-button type="primary" @click="fetchList">搜索</el-button>
      </div>
      <el-table :data="list" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="mobile" label="手机号" width="130" />
        <el-table-column prop="city" label="城市" width="100" />
        <el-table-column prop="interests" label="兴趣" width="150" />
        <el-table-column prop="createdAt" label="注册时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              size="small"
              :type="row.status === 1 ? 'warning' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === 1 ? '封禁' : '解封' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="limit"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="fetchList"
        @current-change="fetchList"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const list = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const keyword = ref('')

const fetchList = async () => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get('/api/admin/users', {
    params: { page: page.value, limit: limit.value, keyword: keyword.value },
    headers: { Authorization: `Bearer ${token}` }
  })
  list.value = res.data.data
  total.value = res.data.total
}

const toggleStatus = async (row: any) => {
  const newStatus = row.status === 1 ? 0 : 1
  const action = newStatus === 0 ? '封禁' : '解封'
  try {
    await ElMessageBox.confirm(`确定要${action}用户 "${row.nickname}" 吗？`, '提示', { type: 'warning' })
    const token = localStorage.getItem('adminToken')
    await axios.put(`/api/admin/users/${row.id}/status`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success(`${action}成功`)
    fetchList()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error(`${action}失败`)
  }
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.users {
  padding: 20px;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.filters {
  margin-bottom: 20px;
}
</style>