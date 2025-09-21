
<template>
  <div class="min-h-screen flex items-center justify-center bg-blue-50">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-4 text-blue-700 text-center">User Dashboard</h2>
      <div class="mb-6">
        <p class="text-gray-700"><span class="font-semibold">Name:</span> John Doe</p>
        <p class="text-gray-700"><span class="font-semibold">Email:</span> johndoe@example.com</p>
        <p class="text-gray-700"><span class="font-semibold">Role:</span> Student</p>
      </div>
      <div class="space-y-2">
        <button class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Take Quiz</button>
        <button class="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">View Results</button>
        <button class="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">Edit Profile</button>
        <button class="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Logout</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

</script>
