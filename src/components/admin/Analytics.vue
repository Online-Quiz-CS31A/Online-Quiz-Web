<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { BarChart2, TrendingUp, Users, AlertTriangle, Activity, Filter, Download, Search, Calendar } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'
import AdminPagination from '@/components/admin/AdminPagination.vue'
import type { LogEntry, AnalyticsSummary } from '@/interfaces/interfaces'

const { success } = useToast()

// RED
const logs = ref<LogEntry[]>([])
const selectedType = ref<string>('all')
const selectedSeverity = ref<string>('all')
const searchQuery = ref('')
const dateRange = ref<{ start: string; end: string }>({
  start: '',
  end: ''
})
const currentPage = ref(1)
const itemsPerPage = 10

// COMPUTED
const analytics = computed<AnalyticsSummary>(() => {
  const now = new Date()
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  
  const recentLogs = logs.value.filter(log => new Date(log.timestamp) > last24h)
  
  return {
    totalLogins: recentLogs.filter(l => l.type === 'login').length,
    quizzesCreated: recentLogs.filter(l => l.type === 'quiz_created').length,
    warningsIssued: recentLogs.filter(l => l.type === 'warning').length,
    activeUsers: new Set(recentLogs.map(l => l.user)).size
  }
})

const filteredLogs = computed(() => {
  let filtered = logs.value

  if (selectedType.value !== 'all') {
    filtered = filtered.filter(log => log.type === selectedType.value)
  }

  if (selectedSeverity.value !== 'all') {
    filtered = filtered.filter(log => log.severity === selectedSeverity.value)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(log =>
      log.user.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.details.toLowerCase().includes(query)
    )
  }

  if (dateRange.value.start && dateRange.value.end) {
    const start = new Date(dateRange.value.start)
    const end = new Date(dateRange.value.end)
    filtered = filtered.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= start && logDate <= end
    })
  }

  return filtered
})

const totalItems = computed(() => filteredLogs.value.length)

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredLogs.value.slice(start, end)
})

const logTypeStats = computed(() => {
  const stats: Record<string, number> = {}
  logs.value.forEach(log => {
    stats[log.type] = (stats[log.type] || 0) + 1
  })
  return stats
})

// METHODS
const generateMockLogs = () => {
  const types: LogEntry['type'][] = ['login', 'quiz_created', 'quiz_submitted', 'warning', 'user_created', 'data_export']
  const severities: LogEntry['severity'][] = ['info', 'warning', 'error', 'success']
  const users = ['john.doe', 'jane.smith', 'admin', 'teacher1', 'student123']
  
  const actions: Record<string, string[]> = {
    login: ['Successful login', 'Failed login attempt', 'Session expired'],
    quiz_created: ['Created new quiz', 'Published quiz', 'Updated quiz settings'],
    quiz_submitted: ['Submitted quiz on time', 'Late submission', 'Auto-submitted due to timeout'],
    warning: ['Tab switch detected', 'Multiple failed login attempts', 'Suspicious activity'],
    user_created: ['New user registered', 'User profile updated', 'Password changed'],
    data_export: ['Exported data as JSON', 'Exported data as CSV', 'Database backup created']
  }

  const mockLogs: LogEntry[] = []
  
  for (let i = 0; i < 100; i++) {
    const type = types[Math.floor(Math.random() * types.length)]
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    const user = users[Math.floor(Math.random() * users.length)]
    const action = actions[type][Math.floor(Math.random() * actions[type].length)]
    
    mockLogs.push({
      id: `log-${i}`,
      timestamp,
      type,
      user,
      action,
      details: `Additional context for ${action}`,
      severity: severities[Math.floor(Math.random() * severities.length)]
    })
  }

  return mockLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
}

const exportLogs = () => {
  const csvContent = [
    ['Timestamp', 'Type', 'User', 'Action', 'Details', 'Severity'],
    ...filteredLogs.value.map(log => [
      new Date(log.timestamp).toLocaleString(),
      log.type,
      log.user,
      log.action,
      log.details,
      log.severity
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `audit-logs-${Date.now()}.csv`
  link.click()
  URL.revokeObjectURL(url)

  success('Audit logs exported successfully')
}

const clearFilters = () => {
  selectedType.value = 'all'
  selectedSeverity.value = 'all'
  searchQuery.value = ''
  dateRange.value = { start: '', end: '' }
  currentPage.value = 1
}

const getTypeIcon = (type: string) => {
  const icons: Record<string, any> = {
    login: Users,
    quiz_created: BarChart2,
    quiz_submitted: Activity,
    warning: AlertTriangle,
    user_created: Users,
    data_export: Download
  }
  return icons[type] || Activity
}

const getTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    login: 'bg-blue-100 text-blue-700',
    quiz_created: 'bg-green-100 text-green-700',
    quiz_submitted: 'bg-purple-100 text-purple-700',
    warning: 'bg-orange-100 text-orange-700',
    user_created: 'bg-indigo-100 text-indigo-700',
    data_export: 'bg-gray-100 text-gray-700'
  }
  return colors[type] || 'bg-gray-100 text-gray-700'
}

const getSeverityColor = (severity: string) => {
  const colors: Record<string, string> = {
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-orange-50 text-orange-700 border-orange-200',
    error: 'bg-red-50 text-red-700 border-red-200'
  }
  return colors[severity] || 'bg-gray-50 text-gray-700 border-gray-200'
}

// LIFECYCLE
onMounted(() => {
  logs.value = generateMockLogs()
})
</script>

<template>
  <div class="p-6 space-y-6">
    <!-- Analytics Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-blue-600">Logins (24h)</p>
            <p class="text-3xl font-bold text-blue-900 mt-2">{{ analytics.totalLogins }}</p>
            <div class="flex items-center gap-1 mt-2">
              <TrendingUp :size="14" class="text-blue-600" />
              <span class="text-xs font-medium text-blue-700">+12% vs yesterday</span>
            </div>
          </div>
          <div class="p-3 bg-blue-200 rounded-xl">
            <Users class="w-7 h-7 text-blue-700" />
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-green-600">Quizzes Created</p>
            <p class="text-3xl font-bold text-green-900 mt-2">{{ analytics.quizzesCreated }}</p>
            <div class="flex items-center gap-1 mt-2">
              <TrendingUp :size="14" class="text-green-600" />
              <span class="text-xs font-medium text-green-700">+8% vs yesterday</span>
            </div>
          </div>
          <div class="p-3 bg-green-200 rounded-xl">
            <BarChart2 class="w-7 h-7 text-green-700" />
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-orange-600">Warnings Issued</p>
            <p class="text-3xl font-bold text-orange-900 mt-2">{{ analytics.warningsIssued }}</p>
            <div class="flex items-center gap-1 mt-2">
              <AlertTriangle :size="14" class="text-orange-600" />
              <span class="text-xs font-medium text-orange-700">{{ analytics.warningsIssued > 0 ? 'Attention needed' : 'All clear' }}</span>
            </div>
          </div>
          <div class="p-3 bg-orange-200 rounded-xl">
            <AlertTriangle class="w-7 h-7 text-orange-700" />
          </div>
        </div>
      </div>

      <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-purple-600">Active Users</p>
            <p class="text-3xl font-bold text-purple-900 mt-2">{{ analytics.activeUsers }}</p>
            <div class="flex items-center gap-1 mt-2">
              <Activity :size="14" class="text-purple-600" />
              <span class="text-xs font-medium text-purple-700">Last 24 hours</span>
            </div>
          </div>
          <div class="p-3 bg-purple-200 rounded-xl">
            <Activity class="w-7 h-7 text-purple-700" />
          </div>
        </div>
      </div>
    </div>

    <!-- Log Type Distribution -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Activity Distribution</h3>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          v-for="(count, type) in logTypeStats"
          :key="type"
          class="p-4 rounded-lg border-2 hover:shadow-md transition-shadow"
          :class="getTypeColor(type as string)"
        >
          <component :is="getTypeIcon(type as string)" :size="20" class="mb-2" />
          <p class="text-2xl font-bold">{{ count }}</p>
          <p class="text-xs font-medium capitalize mt-1">{{ (type as string).replace('_', ' ') }}</p>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <Filter class="w-5 h-5 text-gray-600" />
          <h3 class="text-lg font-semibold text-gray-900">Filter Logs</h3>
        </div>
        <button
          @click="clearFilters"
          class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear All
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <Search :size="14" class="inline mr-1" />
            Search
          </label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="User, action, details..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            v-model="selectedType"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="login">Login</option>
            <option value="quiz_created">Quiz Created</option>
            <option value="quiz_submitted">Quiz Submitted</option>
            <option value="warning">Warning</option>
            <option value="user_created">User Created</option>
            <option value="data_export">Data Export</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Severity</label>
          <select
            v-model="selectedSeverity"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            <Calendar :size="14" class="inline mr-1" />
            Date Range
          </label>
          <div class="flex gap-2">
            <input
              v-model="dateRange.start"
              type="date"
              class="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
            <input
              v-model="dateRange.end"
              type="date"
              class="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Logs Table -->
    <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">Audit Logs</h3>
          <p class="text-sm text-gray-500 mt-1">
            Showing {{ filteredLogs.length }} of {{ logs.length }} entries
          </p>
        </div>
        <button
          @click="exportLogs"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <Download :size="16" />
          Export Logs
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Severity
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="log in paginatedLogs"
              :key="log.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ new Date(log.timestamp).toLocaleString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
                  :class="getTypeColor(log.type)"
                >
                  <component :is="getTypeIcon(log.type)" :size="14" />
                  {{ log.type.replace('_', ' ') }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ log.user }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-700">
                <div>{{ log.action }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ log.details }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="inline-flex px-3 py-1 rounded-full text-xs font-medium border"
                  :class="getSeverityColor(log.severity)"
                >
                  {{ log.severity.toUpperCase() }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <AdminPagination
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :page-size="itemsPerPage"
    />
  </div>
</template>
