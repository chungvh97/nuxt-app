<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>Quản lý Sản phẩm</q-toolbar-title>
        <q-toggle v-model="dark.isActive" checked-icon="dark_mode" color="white" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <q-card flat bordered class="q-pa-md">
          <div class="text-h6 q-mb-md">Thêm sản phẩm</div>

          <q-form @submit.prevent="addProduct">
            <q-input v-model="form.name" label="Tên sản phẩm" outlined class="q-mb-sm" />
            <q-input v-model.number="form.price" label="Giá (VNĐ)" type="number" outlined class="q-mb-sm" />
            <q-btn label="Thêm sản phẩm" type="submit" color="primary" :loading="loading" />
          </q-form>

          <q-separator class="q-my-md" />

          <div class="text-h6">Danh sách sản phẩm</div>
          <q-list bordered>
            <q-item v-for="p in products" :key="p.id" class="q-my-sm">
              <q-item-section>{{ p.name }}</q-item-section>
              <q-item-section>{{ format(p.price) }}đ</q-item-section>
              <q-item-section side>
                <q-btn dense flat icon="edit" @click="openEdit(p)" />
                <q-btn dense flat icon="delete" color="red" @click="removeProduct(p.id)" />
              </q-item-section>
            </q-item>
          </q-list>

          <div class="text-subtitle1 q-mt-md">Tổng tiền: {{ totalPrice.toLocaleString() }} VNĐ</div>

          <q-btn class="q-mt-md" label="Xem hóa đơn" color="secondary" @click="showBill = true" />

          <!-- Dialog Hóa đơn -->
          <q-dialog v-model="showBill">
            <q-card class="q-pa-md" style="min-width: 300px">
              <div ref="bill">
                <div class="text-center text-bold">🧋 TRÀ SỮA PHONG VỊ</div>
                <div class="text-center">Tel: 0914.35.4444</div>
                <div class="q-mt-sm">Ngày: {{ now }}</div>
                <div>Mã HĐ: {{ billId }}</div>
                <q-separator class="q-my-sm" />
                <div v-for="(p, i) in products" :key="p.id">
                  {{ i + 1 }}. {{ p.name }} - {{ format(p.price) }}đ
                </div>
                <q-separator class="q-my-sm" />
                <div class="text-right">Tổng SL: {{ products.length }}</div>
                <div class="text-right">Tổng tiền: {{ totalPrice.toLocaleString() }}đ</div>
              </div>
              <q-btn label="In hóa đơn" color="primary" class="q-mt-sm" @click="printBill" />
            </q-card>
          </q-dialog>

          <!-- Dialog sửa -->
          <q-dialog v-model="editDialog">
            <q-card class="q-pa-md">
              <div class="text-h6">Sửa sản phẩm</div>
              <q-input v-model="editForm.name" label="Tên sản phẩm" outlined class="q-mb-sm" />
              <q-input v-model.number="editForm.price" label="Giá (VNĐ)" type="number" outlined />
              <q-card-actions align="right">
                <q-btn flat label="Hủy" v-close-popup />
                <q-btn flat label="Lưu" color="primary" @click="confirmEdit" />
              </q-card-actions>
            </q-card>
          </q-dialog>

        </q-card>
      </q-page>

      <q-footer class="bg-grey-2 text-center text-caption q-pa-sm">
        © {{ new Date().getFullYear() }} Quản lý sản phẩm
      </q-footer>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { uid, useQuasar } from 'quasar'
import dayjs from 'dayjs'

const { dialog, bottomSheet, loading, loadingBar, notify, dark, screen } = useQuasar();

watch(dark, val => {
  dark.set(val)
  localStorage.setItem('dark-mode', val)
})

onMounted(() => {
  const saved = localStorage.getItem('dark-mode')
  if (saved !== null) {
    dark.value = saved === 'true'
  }
})


const form = ref({ name: '', price: 0 })
const products = ref([])
const showBill = ref(false)
const editDialog = ref(false)
const bill = ref(null)

const now = dayjs().format('DD/MM/YYYY HH:mm:ss')
const billId = Math.floor(100000 + Math.random() * 900000)
const format = v => v.toLocaleString()

const columns = [] // không dùng table ở bản responsive này
const editForm = ref({ id: null, name: '', price: 0 })

function addProduct() {
  if (!form.value.name || form.value.price <= 0) return
  loading.value = true
  setTimeout(() => {
    products.value.push({ id: uid(), ...form.value })
    saveToStorage()
    form.value = { name: '', price: 0 }
    notify({ type: 'positive', message: 'Đã thêm sản phẩm!' })
    loading.value = false
  }, 400)
}

function removeProduct(id) {
  products.value = products.value.filter(p => p.id !== id)
  saveToStorage()
  notify({ type: 'negative', message: 'Đã xóa sản phẩm!' })
}

function openEdit(product) {
  editForm.value = { ...product }
  editDialog.value = true
}

function confirmEdit() {
  const index = products.value.findIndex(p => p.id === editForm.value.id)
  if (index !== -1) {
    products.value[index] = { ...editForm.value }
    saveToStorage()
    notify({ type: 'info', message: 'Đã cập nhật sản phẩm!' })
    editDialog.value = false
  }
}

const totalPrice = computed(() =>
    products.value.reduce((sum, p) => sum + p.price, 0)
)

function saveToStorage() {
  localStorage.setItem('products', JSON.stringify(products.value))
}

function loadFromStorage() {
  const data = localStorage.getItem('products')
  if (data) {
    products.value = JSON.parse(data)
  }
}

function printBill() {
  const printContent = bill.value
  const win = window.open('', '', 'width=300,height=600')
  win.document.write('<html><body>' + printContent.innerHTML + '</body></html>')
  win.document.close()
  win.print()
}

onMounted(loadFromStorage)
</script>

<style scoped>
.q-page {
  max-width: 600px;
  margin: auto;
}
</style>
