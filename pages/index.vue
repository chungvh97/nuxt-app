<script setup lang="ts">
const activeGroup = ref('')
const dataGroup = ref([
  {
    label: 'FE',
    class: 'fe-side'
  },
  {
    label: 'BE',
    class: 'be-side'
  }
])
</script>

<template>
  <q-layout>
    <q-page-container>
      <q-page class="row no-wrap" v-if="!activeGroup">
        <div v-for="item in dataGroup" class="col-6 flex flex-center" :key="item.label" :class="item.class">
          <q-btn
              unelevated
              class="full-width full-height custom-btn"
              :label="item.label"
              @click="activeGroup = item.label"
          />
        </div>
      </q-page>
      <PagesHome :activeGroup="activeGroup" v-if="activeGroup"/>
    </q-page-container>
  </q-layout>
</template>

<style scoped>
/* FIX: Thêm overflow: hidden để ẩn phần tử bị tràn ra ngoài khi scale */
.q-page {
  padding: 0 !important;
  overflow: hidden; /* <-- THÊM DÒNG NÀY */
}

/* Định nghĩa màu nền cho từng bên */
.fe-side {
  background-color: #ffdde1; /* Màu hồng pastel */
}

.be-side {
  background-color: #d4e4ff; /* Màu xanh pastel */
}

/* Tùy chỉnh chung cho button */
.custom-btn {
  font-size: 4rem; /* Kích thước chữ rất lớn */
  font-weight: bold;
  border-radius: 0; /* Bỏ bo góc để lấp đầy màn hình */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Hiệu ứng chuyển động mượt mà */
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* Thêm bóng cho chữ để nổi bật */
}

/* Hiệu ứng khi di chuột vào */
.custom-btn:hover {
  transform: scale(1.02); /* Phóng to nhẹ nút bấm */
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); /* Thêm hiệu ứng đổ bóng */
  z-index: 1; /* Đảm bảo nút được nổi lên trên */
}
</style>
