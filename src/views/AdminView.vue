<template>
  <div class="flex min-h-screen">
    <!-- Sidebar -->
    <aside class="w-64 bg-blue-400 text-black p-4 ">
      <h2 class="text-xl font-bold mb-4 padding-120 bg-blue-500 text-center rounded-md">Admin Panel</h2>
      <ul class="space-y-2">
        <li><a href="#" class="block p-2 hover:bg-blue-700 rounded">User Management</a></li>
        <li><a href="#" class="block p-2 hover:bg-blue-700 rounded">Subjects / Courses</a></li>
        <li><a href="#" class="block p-2 hover:bg-blue-700 rounded">Quiz Settings</a></li>
        <li><a href="#" class="block p-2 hover:bg-blue-700 rounded">Data Export / Import</a></li>
        <li><a href="#" class="block p-2 hover:bg-blue-700 rounded">Audit & Analytics</a></li>
      </ul>
    </aside>

    <!-- Content Area -->
    <main class="flex-1 p-6 bg-blue-100 space-y-6">
      <!-- User Management -->
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">User Management</h2>
        <p>Create, edit, or deactivate accounts. Reset passwords as needed.</p>
        <button class="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add User</button>
      </div>

      <!-- Subjects / Courses -->
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">Subjects / Courses</h2>
        <p>Manage the subject catalog for quiz assignments.</p>
        <button class="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Add Subject</button>
      </div>

      <!-- Quiz Settings -->
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">Quiz Settings</h2>
        <p>Set default time limits, retake policies, and tab-switch thresholds.</p>
        <button class="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Edit Settings</button>
      </div>

      <!-- Data Export / Import -->
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">Data Export / Import</h2>
        <p>Download backups or restore from files.</p>
        <button class="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Export Data</button>
      </div>

      <!-- Audit & Analytics -->
      <div class="bg-white p-4 rounded shadow">
        <h2 class="text-xl font-semibold mb-2">Audit & Analytics</h2>
        <p>View system logs and track activity.</p>
        <button class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">View Logs</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
</script>
