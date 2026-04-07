<template>
  <div class="article-form">
    <el-card>
      <h2>{{ isEdit ? '编辑文章' : '新建文章' }}</h2>
      <el-form :model="form" label-width="100px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="摘要">
          <el-input type="textarea" v-model="form.summary" :rows="2" />
        </el-form-item>
        <el-form-item label="封面图">
          <el-upload
            action="#"
            :before-upload="handleUpload"
            list-type="picture"
            :file-list="coverFileList"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
          >
            <el-button type="primary">上传图片</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category" placeholder="请选择分类">
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
        </el-form-item>
        <el-form-item label="内容" required>
          <el-input type="textarea" v-model="form.content" :rows="12" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存</el-button>
          <el-button @click="router.back()">取消</el-button>
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
  title: '',
  summary: '',
  coverImage: '',
  content: '',
  category: '养生保健'
})
const coverFileList = ref([])

const handleUpload = (file: File) => {
  const url = URL.createObjectURL(file)
  form.value.coverImage = url
  coverFileList.value = [{ name: file.name, url }]
  return false
}
const handlePreview = (file: any) => { window.open(file.url) }
const handleRemove = () => { form.value.coverImage = ''; coverFileList.value = [] }

const fetchDetail = async (id: number) => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get(`/api/admin/articles/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  form.value = res.data
  if (form.value.coverImage) {
    coverFileList.value = [{ name: '封面', url: form.value.coverImage }]
  }
}

const save = async () => {
  const token = localStorage.getItem('adminToken')
  const method = isEdit.value ? 'put' : 'post'
  const url = isEdit.value ? `/api/admin/articles/${route.params.id}` : '/api/admin/articles'
  try {
    await axios[method](url, form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('保存成功')
    router.push('/admin/articles')
  } catch (err) {
    ElMessage.error('保存失败')
  }
}

onMounted(() => {
  if (route.params.id) {
    isEdit.value = true
    fetchDetail(Number(route.params.id))
  }
})
</script>

<style scoped>
.article-form {
  padding: 20px;
}
</style>