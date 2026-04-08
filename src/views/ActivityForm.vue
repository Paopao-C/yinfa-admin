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
        <el-form-item label="所在城市">
          <el-input v-model="form.city" placeholder="（例如：长沙市）" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="form.address" placeholder="详细地址" />
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
  city: '',
  address: '',
  contactPerson: '',
  contactPhone: '',
  remainingSlots: 0,
  status: 1
})
const coverFileList = ref([])

const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('adminToken');
  try {
    const res = await axios.post('/api/admin/upload', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    // 上传成功，保存返回的 URL
    form.value.coverImage = res.data.url;
    coverFileList.value = [{ name: file.name, url: res.data.url }];
    ElMessage.success('上传成功');
  } catch (err) {
    ElMessage.error('上传失败');
    console.error(err);
  }
  return false; // 阻止自动上传
};

const fetchDetail = async (id: number) => {
  const token = localStorage.getItem('adminToken')
  const res = await axios.get(`/api/admin/activities/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  // 添加调试信息，查看后端返回的实际数据结构
  console.log('后端返回的数据:', res.data)
  
  form.value = res.data
  if (form.value.coverImage) {
    coverFileList.value = [{ name: '封面', url: form.value.coverImage }]
  }
}

const save = async () => {
   // 打印即将提交的数据，方便调试
   console.log('即将提交的数据:', form.value)
  // 添加数据验证
  if (!form.value.city) {
    ElMessage.error('请填写所在城市')
    return
  }
  
  if (!form.value.address) {
    ElMessage.error('请填写活动地点')
    return
  }

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