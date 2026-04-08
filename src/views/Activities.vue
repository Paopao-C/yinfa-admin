<template>
  <div class="activities">
    <el-card>
      <div class="header">
        <h2>活动管理</h2>
        <el-button type="primary" @click="handleCreate">新建活动</el-button>
      </div>
      <div class="filters">
        <el-input
          v-model="keyword"
          placeholder="搜索标题"
          clearable
          style="width: 200px; margin-right: 10px"
          @clear="fetchList"
          @keyup.enter="fetchList"
        />
        <el-select v-model="statusFilter" placeholder="活动状态" clearable style="width: 150px; margin-right: 10px" @change="fetchList">
          <el-option label="未开始" value="upcoming" />
          <el-option label="进行中" value="active" />
          <el-option label="已结束" value="ended" />
        </el-select>
        <el-button type="primary" @click="fetchList">搜索</el-button>
      </div>
      <el-table :data="list" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" />
        <el-table-column prop="city" label="所在城市" />
        <el-table-column prop="address" label="详细地址" />
        <el-table-column prop="startTime" label="开始时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.startTime) }}</template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.endTime) }}</template>
        </el-table-column>
        <el-table-column prop="remainingSlots" label="剩余名额" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row)">{{ getStatusText(row) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
            <el-button size="small" type="success" @click="handleFavorites(row.id)">收藏名单</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
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

    <!-- 收藏名单对话框 -->
    <el-dialog v-model="favoritesVisible" title="收藏名单" width="600px">
      <el-table :data="favoritesList" border>
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="mobile" label="手机号" />
        <el-table-column prop="avatar" label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" />
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="favoritesVisible = false">关闭</el-button>
        <el-button type="primary" @click="exportFavorites">导出 Excel</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const list = ref([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const keyword = ref('')
const statusFilter = ref('')

const favoritesVisible = ref(false)
const favoritesList = ref([])
const currentActivityId = ref<number | null>(null)

const fetchList = async () => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get('/api/admin/activities', {
    params: { page: page.value, limit: limit.value, keyword: keyword.value, status: statusFilter.value },
    headers: { Authorization: `Bearer ${token}` }
  })
  console.log('后端返回的数据:', res.data)
  list.value = res.data.data
  total.value = res.data.total
}

const handleCreate = () => {
  router.push('/admin/activities/create')
}

const handleEdit = (id: number) => {
  router.push(`/admin/activities/edit/${id}`)
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该活动吗？', '提示', { type: 'warning' })
    const token = localStorage.getItem('adminToken')
    await axios.delete(`/api/admin/activities/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('删除成功')
    fetchList()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败')
  }
}

const handleFavorites = async (id: number) => {
  currentActivityId.value = id
  const token = localStorage.getItem('adminToken')
  try {
    const res = await axios.get(`/api/admin/activities/${id}/favorites`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    favoritesList.value = res.data
    favoritesVisible.value = true
  } catch (err) {
    ElMessage.error('获取收藏名单失败')
  }
}

const exportFavorites = async () => {
  // 暂未实现
  ElMessage.info('导出功能开发中')
}

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}

const getStatusType = (row: any) => {
  const now = new Date()
  const start = new Date(row.startTime)
  const end = new Date(row.endTime)
  if (now < start) return 'info'
  if (now > end) return 'danger'
  return 'success'
}

const getStatusText = (row: any) => {
  const now = new Date()
  const start = new Date(row.startTime)
  const end = new Date(row.endTime)
  if (now < start) return '未开始'
  if (now > end) return '已结束'
  return '进行中'
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.activities {
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