<template>
  <div class="circles">
    <el-card>
      <div class="header">
        <h2>圈子管理</h2>
        <el-button type="primary" @click="handleCreate">新建圈子</el-button>
      </div>
      <div class="filters">
        <el-input
          v-model="keyword"
          placeholder="搜索圈子名称"
          clearable
          style="width: 200px; margin-right: 10px"
          @clear="fetchList"
          @keyup.enter="fetchList"
        />
        <el-button type="primary" @click="fetchList">搜索</el-button>
      </div>
      <el-table :data="list" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">{{ row.icon || '📁' }}</template>
        </el-table-column>
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="postCount" label="动态数量" width="100" />
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150">
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

    <!-- 编辑/新增对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="名称" required>
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="form.icon" placeholder="输入 emoji 或图标字符" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
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

const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = ref({ id: null, name: '', icon: '', status: 1 })
const isEdit = ref(false)

const fetchList = async () => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get('/api/admin/circles', {
    params: { page: page.value, limit: limit.value, keyword: keyword.value },
    headers: { Authorization: `Bearer ${token}` }
  })
  list.value = res.data.data
  total.value = res.data.total
}

const handleCreate = () => {
  isEdit.value = false
  form.value = { id: null, name: '', icon: '', status: 1 }
  dialogTitle.value = '新建圈子'
  dialogVisible.value = true
}

const handleEdit = (id: number) => {
  const circle = list.value.find(c => c.id === id)
  if (circle) {
    isEdit.value = true
    form.value = { ...circle }
    dialogTitle.value = '编辑圈子'
    dialogVisible.value = true
  }
}

const save = async () => {
  const token = localStorage.getItem('adminToken')
  const url = isEdit.value ? `/api/admin/circles/${form.value.id}` : '/api/admin/circles'
  const method = isEdit.value ? 'put' : 'post'
  try {
    await axios[method](url, { name: form.value.name, icon: form.value.icon, status: form.value.status }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('保存成功')
    dialogVisible.value = false
    fetchList()
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该圈子吗？如果圈子下有动态将无法删除。', '提示', { type: 'warning' })
    const token = localStorage.getItem('adminToken')
    await axios.delete(`/api/admin/circles/${id}`, {
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
.circles {
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