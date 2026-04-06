<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h2>平台运营数据概览</h2>
    </div>

    <!-- 第一行：核心统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">总用户数</div>
            <div class="stat-number">{{ stats.totalUsers }}</div>
            <div class="stat-icon user-icon"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">总圈子数</div>
            <div class="stat-number">{{ stats.totalCircles }}</div>
            <div class="stat-icon circle-icon"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">总活动数</div>
            <div class="stat-number">{{ stats.totalActivities }}</div>
            <div class="stat-icon activity-icon"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">总动态数</div>
            <div class="stat-number">{{ stats.totalPosts }}</div>
            <div class="stat-icon post-icon"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第二行：更多统计卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">总点赞数</div>
            <div class="stat-number">{{ stats.totalLikes }}</div>
            <div class="stat-icon like-icon"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">养生文章数</div>
            <div class="stat-number">{{ stats.totalHealthArticles }}</div>
            <div class="stat-icon article-icon"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">用户总收藏</div>
            <div class="stat-number">{{ stats.totalFavorites }}</div>
            <div class="stat-icon favorite-icon"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">进行中活动</div>
            <div class="stat-number">{{ stats.activeActivities }}</div>
            <div class="stat-icon active-icon"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 第三行：活动状态 -->
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="12">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">未开始活动</div>
            <div class="stat-number">{{ stats.upcomingActivities }}</div>
            <div class="stat-icon upcoming-icon"></div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="stat-card">
          <div class="card-content">
            <div class="stat-title">已结束活动</div>
            <div class="stat-number">{{ stats.endedActivities }}</div>
            <div class="stat-icon ended-icon"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区域 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <el-card class="chart-card">
          <div ref="userTrendChart" style="height: 400px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <el-card class="chart-card">
          <div ref="topActivitiesChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="chart-card">
          <div ref="circleActivityChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const stats = ref({
  totalUsers: 0,
  totalCircles: 0,
  totalActivities: 0,
  activeActivities: 0,
  upcomingActivities: 0,
  endedActivities: 0,
  totalPosts: 0,
  totalLikes: 0,
  totalHealthArticles: 0,
  totalFavorites: 0,
  userTrend: { dates: [], counts: [] },
  topActivities: [],
  circleActivity: [],
})

const userTrendChart = ref(null)
const topActivitiesChart = ref(null)
const circleActivityChart = ref(null)

const fetchStats = async () => {
  const token = localStorage.getItem('adminToken')
  try {
    const res = await axios.get('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
    stats.value = res.data
    initCharts()
  } catch (err) {
    console.error('获取统计数据失败', err)
  }
}

const initCharts = () => {
  // 用户增长趋势折线图
  if (userTrendChart.value) {
    const chart = echarts.init(userTrendChart.value)
    chart.setOption({
      title: {
        text: '近7天用户增长趋势',
        textStyle: { color: '#8B4513', fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: stats.value.userTrend.dates,
        axisLine: { lineStyle: { color: '#A0522D' } },
        axisLabel: { color: '#8B4513' },
      },
      yAxis: {
        type: 'value',
        name: '新增用户数',
        nameTextStyle: { color: '#8B4513' },
        axisLine: { lineStyle: { color: '#A0522D' } },
        axisLabel: { color: '#8B4513' },
        splitLine: { lineStyle: { color: '#f0e6d2' } },
      },
      series: [
        {
          type: 'line',
          data: stats.value.userTrend.counts,
          smooth: true,
          areaStyle: { color: 'rgba(139, 69, 19, 0.1)' },
          lineStyle: { color: '#8B4513', width: 2 },
          itemStyle: { color: '#8B4513' },
        },
      ],
    })
  }

  // 热门活动收藏排行榜（柱状图）
  if (topActivitiesChart.value && stats.value.topActivities.length) {
    const chart = echarts.init(topActivitiesChart.value)
    const titles = stats.value.topActivities.map((item) =>
      item.title.length > 10 ? item.title.slice(0, 10) + '...' : item.title,
    )
    const counts = stats.value.topActivities.map((item) => item.favoriteCount)
    chart.setOption({
      title: {
        text: '热门活动收藏排行榜',
        textStyle: { color: '#8B4513', fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: titles,
        axisLabel: {
          rotate: 30,
          color: '#8B4513',
        },
        axisLine: { lineStyle: { color: '#A0522D' } },
      },
      yAxis: {
        type: 'value',
        name: '收藏数',
        nameTextStyle: { color: '#8B4513' },
        axisLine: { lineStyle: { color: '#A0522D' } },
        axisLabel: { color: '#8B4513' },
        splitLine: { lineStyle: { color: '#f0e6d2' } },
      },
      series: [
        {
          type: 'bar',
          data: counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#D2B48C' },
              { offset: 1, color: '#8B4513' },
            ]),
          },
        },
      ],
    })
  }

  // 各圈子动态活跃度（柱状图）
  if (circleActivityChart.value && stats.value.circleActivity.length) {
    const chart = echarts.init(circleActivityChart.value)
    const names = stats.value.circleActivity.map((item) => item.circleName)
    const counts = stats.value.circleActivity.map((item) => item.postCount)
    chart.setOption({
      title: {
        text: '各圈子动态活跃度',
        textStyle: { color: '#8B4513', fontSize: 16, fontWeight: 'bold' },
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      xAxis: {
        type: 'category',
        data: names,
        axisLabel: {
          rotate: 30,
          color: '#8B4513',
        },
        axisLine: { lineStyle: { color: '#A0522D' } },
      },
      yAxis: {
        type: 'value',
        name: '动态数量',
        nameTextStyle: { color: '#8B4513' },
        axisLine: { lineStyle: { color: '#A0522D' } },
        axisLabel: { color: '#8B4513' },
        splitLine: { lineStyle: { color: '#f0e6d2' } },
      },
      series: [
        {
          type: 'bar',
          data: counts,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#F5DEB3' },
              { offset: 1, color: '#CD853F' },
            ]),
          },
        },
      ],
    })
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
  background-color: #f5f2e8;
  min-height: 100%;
}

.dashboard-header {
  margin-bottom: 30px;
  text-align: center;
  padding: 20px 0;
}

.dashboard-header h2 {
  color: #8b4513;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.stat-card {
  border-radius: 10px;
  border: none;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.1);
  background: linear-gradient(135deg, #fff9e6 0%, #f5f2e8 100%);
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(139, 69, 19, 0.2);
}

.card-content {
  position: relative;
  padding: 25px;
  text-align: left;
}

.stat-title {
  font-size: 14px;
  color: #a0522d;
  margin-bottom: 10px;
  font-weight: 500;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #8b4513;
  margin-bottom: 15px;
  font-family: 'Arial', sans-serif;
}

.stat-icon {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(139, 69, 19, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #8b4513;
}

.user-icon::before {
  content: '👥';
}

.circle-icon::before {
  content: '⭕';
}

.activity-icon::before {
  content: '📅';
}

.post-icon::before {
  content: '📝';
}

.like-icon::before {
  content: '👍';
}

.article-icon::before {
  content: '📚';
}

.favorite-icon::before {
  content: '❤️';
}

.active-icon::before {
  content: '🔄';
}

.upcoming-icon::before {
  content: '⏰';
}

.ended-icon::before {
  content: '✅';
}

.chart-card {
  border-radius: 10px;
  border: none;
  box-shadow: 0 4px 15px rgba(139, 69, 19, 0.1);
  background-color: white;
  margin-bottom: 20px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .dashboard {
    padding: 10px;
  }

  .card-content {
    padding: 15px;
  }

  .stat-number {
    font-size: 24px;
  }

  .dashboard-header h2 {
    font-size: 24px;
  }
}
</style>
