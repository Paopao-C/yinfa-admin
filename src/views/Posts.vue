<template>
  <div class="posts">
    <el-card>
      <div class="header">
        <h2>圈子动态管理</h2>
        <el-button type="primary" @click="$router.push('/admin/posts/create')">新建内容</el-button>
      </div>
      <div class="filters">
        <el-select
          v-model="circleId"
          placeholder="选择圈子"
          clearable
          style="width: 200px; margin-right: 10px"
          @change="fetchList"
        >
          <el-option
            v-for="circle in circles"
            :key="circle.id"
            :label="circle.name"
            :value="circle.id"
          />
        </el-select>
        <el-input
          v-model="keyword"
          placeholder="搜索内容"
          clearable
          style="width: 200px; margin-right: 10px"
          @clear="fetchList"
          @keyup.enter="fetchList"
        />
        <el-button type="primary" @click="fetchList">搜索</el-button>
      </div>
      <el-table :data="list" border style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="user.nickname" label="用户" width="120" />
        <el-table-column prop="circle.name" label="所属圈子" width="120" />
        <el-table-column prop="content" label="内容" show-overflow-tooltip />
        <el-table-column prop="likes" label="点赞数" width="80" />
        <el-table-column prop="createdAt" label="发布时间" width="160">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row.id)">查看详情</el-button>
          <el-button size="small" type="primary" @click="$router.push(`/admin/posts/edit/${row.id}`)">编辑</el-button>
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

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="帖子详情" width="600px">
      <div v-if="currentPost">
        <p><strong>用户：</strong>{{ currentPost.user?.nickname }}</p>
        <p><strong>圈子：</strong>{{ currentPost.circle?.name }}</p>
        <p><strong>内容：</strong>{{ currentPost.content }}</p>
        <p><strong>图片：</strong></p>
        <div v-if="currentPost.images && currentPost.images.length">
          <el-image
            v-for="(img, idx) in currentPost.images"
            :key="idx"
            :src="img"
            style="width: 100px; height: 100px; margin-right: 10px"
            :preview-src-list="currentPost.images"
          />
        </div>
        <p><strong>点赞数：</strong>{{ currentPost.likes }}</p>
        <p><strong>发布时间：</strong>{{ formatDateTime(currentPost.createdAt) }}</p>
        <hr />
        <h4>评论列表</h4>
        <div v-for="comment in currentComments" :key="comment.id" style="margin-bottom: 10px">
          <strong>{{ comment.user?.nickname }}：</strong> {{ comment.content }}
          <span style="color: #999; margin-left: 10px">{{ formatDateTime(comment.createdAt) }}</span>
        </div>
      </div>
    </el-dialog>

     <!-- 新增：编辑对话框 -->
  <el-dialog v-model="editVisible" title="编辑帖子" width="600px" @closed="resetEditForm">
    <el-form :model="editForm" label-width="80px">
      <el-form-item label="内容">
        <el-input type="textarea" v-model="editForm.content" rows="4" />
      </el-form-item>
      <el-form-item label="图片">
        <el-upload
          action="#"
          :before-upload="handleEditUpload"
          list-type="picture"
          :file-list="editFileList"
          :on-preview="handlePreview"
          :on-remove="handleEditRemove"
        >
          <el-button type="primary">上传图片</el-button>
        </el-upload>
        <div class="tip">支持jpg/png，最多9张，每张不超过5MB</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editVisible = false">取消</el-button>
      <el-button type="primary" @click="saveEdit" :loading="editLoading">保存</el-button>
    </template>
  </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'
// 定义接口类型
interface User {
  id: number;
  nickname: string;
}

interface Circle {
  id: number;
  name: string;
}

interface Post {
  id: number;
  user?: User;
  circle?: Circle;
  content: string;
  images?: string[];
  likes: number;
  createdAt: string;
}

interface Comment {
  id: number;
  user?: User;
  content: string;
  createdAt: string;
}
const list = ref<Post[]>([])
const page = ref(1)
const limit = ref(10)
const total = ref(0)
const circleId = ref('')
const keyword = ref('')
const circles = ref<Circle[]>([]) // 圈子列表用于筛选
const router = useRouter()

const detailVisible = ref(false)
const currentPost = ref<Post | null>(null)
const currentComments = ref<Comment[]>([])
// 新增响应式变量
const editVisible = ref(false)
const editLoading = ref(false)
const editForm = ref({ id: 0, content: '', images: [] })
const editFileList = ref<{ name: string; url: string }[]>([])

// 打开编辑对话框
const openEdit = (row: any) => {
  editForm.value = {
    id: row.id,
    content: row.content,
    images: row.images || []
  }
  // 将现有图片转换成 file-list 格式
  editFileList.value = (row.images || []).map((url: string, index: number) => ({
    name: `图片${index+1}`,
    url: url
  }))
  editVisible.value = true
}

const fetchCircles = async () => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get('/api/admin/circles', {
    headers: { Authorization: `Bearer ${token}` }
  })
  circles.value = res.data.data
}

const fetchList = async () => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get('/api/admin/posts', {
    params: { page: page.value, limit: limit.value, circleId: circleId.value, keyword: keyword.value },
    headers: { Authorization: `Bearer ${token}` }
  })
  list.value = res.data.data
  total.value = res.data.total
}

const viewDetail = async (id: number) => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get(`/api/admin/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  currentPost.value = res.data.post
  currentComments.value = res.data.comments
  detailVisible.value = true
}
const handleCreate = () => {
  router.push('/admin/articles/create')
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该帖子吗？删除后不可恢复。', '提示', { type: 'warning' })
    const token = localStorage.getItem('adminToken')
    await axios.delete(`/api/admin/posts/${id}`, {
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
// 上传图片（复用上传接口）
const handleEditUpload = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const token = localStorage.getItem('adminToken')
  try {
    const res = await axios.post('/api/admin/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    })
    // 将新图片URL添加到 editForm.images
    if (!editForm.value.images) editForm.value.images = []
    editForm.value.images.push(res.data.url)
    editFileList.value.push({ name: file.name, url: res.data.url })
    ElMessage.success('上传成功')
  } catch (err) {
    ElMessage.error('上传失败')
  }
  return false
}

// 移除图片
const handleEditRemove = (file: any) => {
  const url = file.url
  editForm.value.images = editForm.value.images.filter((img: string) => img !== url)
  editFileList.value = editFileList.value.filter((item: any) => item.url !== url)
}

// 保存编辑
const saveEdit = async () => {
  if (!editForm.value.content.trim()) {
    ElMessage.warning('内容不能为空')
    return
  }
  editLoading.value = true
  const token = localStorage.getItem('adminToken')
  try {
    await axios.put(`/api/admin/posts/${editForm.value.id}`, {
      content: editForm.value.content,
      images: editForm.value.images
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('保存成功')
    editVisible.value = false
    fetchList() // 刷新列表
  } catch (err) {
    ElMessage.error('保存失败')
  } finally {
    editLoading.value = false
  }
}

// 重置表单
const resetEditForm = () => {
  editForm.value = { id: 0, content: '', images: [] }
  editFileList.value = []
}

onMounted(() => {
  fetchCircles()
  fetchList()
})
</script>

<style scoped>
.posts {
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
.tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
.operation-buttons {
  display: flex;
  gap: 8px; /* 设置按钮之间的间距 */
  
}

.operation-buttons .el-button {
  flex: 1; /* 让按钮等宽分布 */
  min-width: 60px; /* 设置最小宽度 */
  white-space: nowrap; /* 防止文字换行 */
}
</style>