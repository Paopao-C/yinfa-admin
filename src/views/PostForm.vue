<template>
  <div class="post-form">
    <el-card>
      <h2>{{ isEdit ? '编辑帖子' : '新建帖子' }}</h2>
      <el-form :model="form" label-width="100px">
        <el-form-item label="选择圈子" required>
          <el-select v-model="form.circleId" placeholder="请选择圈子" style="width: 100%">
            <el-option
              v-for="circle in circles"
              :key="circle.id"
              :label="circle.name"
              :value="circle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input type="textarea" v-model="form.content" rows="6" />
        </el-form-item>
        <el-form-item label="图片">
          <el-upload
            action="#"
            :before-upload="handleUpload"
            list-type="picture"
            :file-list="fileList"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            multiple
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>
          <div class="tip">支持jpg/png，最多9张，每张不超过5MB</div>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
const isEdit = ref(false)
const form = ref({
  circleId: null,
  content: '',
  images: []
})
const fileList = ref([])
const circles = ref([])
// 获取圈子列表
const fetchCircles = async () => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get('/api/admin/circles', {
    headers: { Authorization: `Bearer ${token}` }
  })
  circles.value = res.data.data
}

// 图片上传
const handleUpload = async (file: File) => {
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
    form.value.images.push(res.data.url)
    fileList.value.push({ name: file.name, url: res.data.url })
    ElMessage.success('上传成功')
  } catch (err) {
    ElMessage.error('上传失败')
  }
  return false
}
const handlePreview = (file: any) => { window.open(file.url) }
const handleRemove = (file: any) => {
  const url = file.url
  form.value.images = form.value.images.filter(img => img !== url)
  fileList.value = fileList.value.filter(item => item.url !== url)
}

// 保存
const save = async () => {
  if (!form.value.circleId) {
    ElMessage.warning('请选择圈子')
    return
  }
  if (!form.value.content.trim()) {
    ElMessage.warning('内容不能为空')
    return
  }
  const token = localStorage.getItem('adminToken')
  const method = isEdit.value ? 'put' : 'post'
  const url = isEdit.value ? `/api/admin/posts/${route.params.id}` : '/api/admin/posts'
  try {
    // 注意：这里不再发送 userId，后端应根据 Token 识别管理员或由数据库默认处理
    await axios[method](url, form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('保存成功')
    router.push('/admin/posts')
  } catch (err: any) {
    console.error('保存失败详情:', err)
    // 尝试获取后端返回的具体错误信息
    const msg = err.response?.data?.message || err.message || '保存失败'
    ElMessage.error(msg)
  }
}

// 编辑时获取详情
const fetchDetail = async (id: number) => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get(`/api/admin/posts/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  const post = res.data.post
  form.value = {
    circleId: post.circleId,
    content: post.content,
    images: post.images || []
  }
  fileList.value = (post.images || []).map((url: string, idx: number) => ({
    name: `图片${idx+1}`,
    url
  }))
}

onMounted(() => {
  fetchCircles()
  if (route.params.id) {
    isEdit.value = true
    fetchDetail(Number(route.params.id))
  }
})
</script>

<style scoped>
.post-form {
  padding: 20px;
}
.tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}
</style>