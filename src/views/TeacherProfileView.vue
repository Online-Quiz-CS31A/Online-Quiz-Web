<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
const Header = defineAsyncComponent(() => import('@/components/Header.vue'))
const ProfileTab = defineAsyncComponent(() => import('@/components/profile/ProfileTab.vue'))
const AccountSettingsTab = defineAsyncComponent(() => import('@/components/profile/AccountSettingsTab.vue'))
const NotificationsTab = defineAsyncComponent(() => import('@/components/profile/NotificationsTab.vue'))
const SecurityTab = defineAsyncComponent(() => import('@/components/profile/SecurityTab.vue'))

const tabs = [
  { id: 'profile', label: 'Profile', icon: 'fas fa-user' },
  { id: 'account', label: 'Account Settings', icon: 'fas fa-cog' },
  { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
  { id: 'security', label: 'Security', icon: 'fas fa-shield-alt' },
] as const

type TabId = typeof tabs[number]['id']
const activeTab = ref<TabId>('profile')

const route = useRoute()
const setTabFromQuery = () => {
  const q = String(route.query.tab || '')
  if (q === 'profile' || q === 'account' || q === 'notifications' || q === 'security') {
    activeTab.value = q as TabId
  }
}

onMounted(setTabFromQuery)
watch(() => route.query.tab, setTabFromQuery)
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <Header breadcrumb="Dashboard > Profile & Settings" />

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <!-- Tabs -->
        <div class="flex border-b border-gray-200">
          <button
            v-for="t in tabs"
            :key="t.id"
            class="nav-tab px-6 py-4 text-sm font-medium hover:bg-slate-50"
            :class="{ 'border-b-2 border-sky-600 text-sky-600 font-semibold bg-sky-50': activeTab === t.id }"
            @click="activeTab = t.id"
          >
            <i :class="t.icon + ' mr-2'" />
            {{ t.label }}
          </button>
        </div>

        <!-- Tab contents -->
        <section v-show="activeTab === 'profile'" class="p-6">
          <ProfileTab />
        </section>
        <section v-show="activeTab === 'account'" class="p-6">
          <AccountSettingsTab />
        </section>
        <section v-show="activeTab === 'notifications'" class="p-6">
          <NotificationsTab />
        </section>
        <section v-show="activeTab === 'security'" class="p-6">
          <SecurityTab />
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.nav-tab {
  transition: all .15s ease;
}
</style>
