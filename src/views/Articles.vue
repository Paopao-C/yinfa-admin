<template>
  <div class="articles">
    <el-card>
      <div class="header">
        <h2>养生文章管理</h2>
        <el-button type="primary" @click="handleCreate">新建文章</el-button>
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
        <el-select v-model="categoryFilter" placeholder="分类" clearable style="width: 150px; margin-right: 10px" @change="fetchList">
          <el-option label="养生保健" value="养生保健" />
          <el-option label="疾病预防" value="疾病预防" />
          <el-option label="慢性病管理" value="慢性病管理" />
          <el-option label="饮食调理" value="饮食调理" />
          <el-option label="睡眠健康" value="睡眠健康" />
          <el-option label="季节养生" value="季节养生" />
          <el-option label="五官保健" value="五官保健" />
          <el-option label="用药指导" value="用药指导" />
          <el-option label="中医养生" value="中医养生" />
        </el-select>
        <el-button type="primary" @click="fetchList">搜索</el-button>
      </div>
      <el-table :data="list" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="viewCount" label="阅读量" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row.id)">编辑</el-button>
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
const categoryFilter = ref('')

const fetchList = async () => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get('/api/admin/articles', {
    params: { page: page.value, limit: limit.value, keyword: keyword.value, category: categoryFilter.value },
    headers: { Authorization: `Bearer ${token}` }
  })
  list.value = res.data.data
  total.value = res.data.total
}

const handleCreate = () => {
  router.push('/admin/articles/create')
}

const handleEdit = (id: number) => {
  router.push(`/admin/articles/edit/${id}`)
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该文章吗？', '提示', { type: 'warning' })
    const token = localStorage.getItem('adminToken')
    await axios.delete(`/api/admin/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('删除成功')
    fetchList()
  } catch (err) {
    if (err !== 'cancel') ElMessage.error('删除失败')
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
.articles {
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