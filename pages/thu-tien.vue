<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import { usePaymentStore } from '~/stores/payment'
import * as XLSX from "xlsx";

const store = usePaymentStore()

const qrUrl = computed(() => {
  const base = `https://img.vietqr.io/image/VIB-006365321-compact2.png`
  const params = new URLSearchParams({
    addInfo: name.value
  })
  return `${base}?${params.toString()}`
})
const users = ref([])


function onFileAdded(files:any) {
  isLoading.value = true
  const reader = new FileReader()
  reader.onload = (e:any) => {
    const workbook = XLSX.read(e.target.result, { type: 'binary' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(sheet)

    // set data to store
    store.setPeople(data.map((row:any) => ({
      name: row['Tên'],
      amount: row['Số tiền'],
      paid: false
    })))
  }
  isLoading.value = false
  reader.readAsBinaryString(files[0])
}

const selectedPerson = ref<{ name: string; amount: number } | null>(null)
const showDialog = ref(false)

const isLoading = ref(false)

function openPaymentModal(row: { name: string; amount: number }) {
  selectedPerson.value = row
  showDialog.value = true
}
</script>

<template>
  <q-layout>
    <q-page-container>
<!--      add class khi trên 768 thì dùng row, còn dưới 768 thì dùng column-->
      <div class="row row-wrap q-gutter-sm q-mt-sm q-mx-sm">
          <q-uploader label="Import danh sách" accept=".xlsx" @added="onFileAdded" />
          <StatementUpload />
      </div>

      <q-separator class="q-my-sm" />

      <q-page>
        <q-table
            :rows="store.people"
            :loading="isLoading"
            :pagination="{ rowsPerPage: 10 }"
            @row-click="(_, row) => openPaymentModal(row)"
            :columns="[
              { name: 'name', label: 'Họ tên', field: 'name', align: 'left' },
              {
                name: 'amount',
                label: 'Số tiền',
                field: 'amount',
                align: 'right',
                format: val => `${val.toLocaleString('vi-VN')}`
              },
              {
                name: 'paid',
                label: 'Đã đóng',
                field: row => row.paid ? '✅' : '❌',
                align: 'center'
              }
            ]"
        />

        <!-- Gọi component modal -->
        <PaymentDialog v-model="showDialog" :person="selectedPerson" />
      </q-page>
    </q-page-container>
  </q-layout>
</template>
