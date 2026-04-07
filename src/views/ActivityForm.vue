<template>
  <div class="activity-form">
    <el-card>
      <h2>{{ isEdit ? '编辑活动' : '新建活动' }}</h2>
      <el-form :model="form" label-width="120px">
        <el-form-item label="标题" required>
          <el-input v-model="form.title" />
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
        <el-form-item label="开始时间" required>
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" required>
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.address" placeholder="详细地址" />
        </el-form-item>
        <el-form-item label="经纬度">
          <el-input v-model="form.latitude" placeholder="纬度" style="width: 45%; margin-right: 10%" />
          <el-input v-model="form.longitude" placeholder="经度" style="width: 45%" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="form.contactPerson" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="form.contactPhone" />
        </el-form-item>
        <el-form-item label="剩余名额">
          <el-input-number v-model="form.remainingSlots" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
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
  coverImage: '',
  startTime: '',
  endTime: '',
  address: '',
  latitude: '',
  longitude: '',
  contactPerson: '',
  contactPhone: '',
  remainingSlots: 0,
  status: 1
})
const coverFileList = ref([])

const handleUpload = (file: File) => {
  // 实际应调用后端上传接口，这里简化使用临时URL
  const url = URL.createObjectURL(file)
  form.value.coverImage = url
  coverFileList.value = [{ name: file.name, url }]
  return false
}
const handlePreview = (file: any) => { window.open(file.url) }
const handleRemove = () => { form.value.coverImage = ''; coverFileList.value = [] }

const fetchDetail = async (id: number) => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get(`/api/admin/activities/${id}`, {
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
  const url = isEdit.value ? `/api/admin/activities/${route.params.id}` : '/api/admin/activities'
  try {
    await axios[method](url, form.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    ElMessage.success('保存成功')
    router.push('/admin/activities')
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
.activity-form {
  padding: 20px;
}
</style>