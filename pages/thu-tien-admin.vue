<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { usePaymentStore } from '~/stores/payment'
import { useQuasar } from 'quasar'

const { notify } = useQuasar()
const store = usePaymentStore()

const selectedPerson = ref<{ name: string; amount: number } | null>(null)
const showDialog = ref(false)
const isLoading = ref(false)

function openPaymentModal(row: { name: string; amount: number }) {
  selectedPerson.value = row
  showDialog.value = true
}

const jsonOutput = ref('')
const editableJson = ref('')

function normalize(str: string): string {
  return str.toString().trim().replace(/\s+/g, ' ')
}

async function fetchMembers() {
  const { data, error } = await store.fetchMembers()
  if (data) {
    jsonOutput.value = JSON.stringify(data, null, 2)
    editableJson.value = JSON.stringify(data, null, 2)
    notify({ type: 'info', message: '📥 Load dữ liệu thành công' })
  }
  if (error) notify({ type: 'negative', message: '❌ Không thể tải dữ liệu', timeout: 1000 })
}

onMounted(fetchMembers)

async function onImportExcel(files: File[]) {
  const file = files[0]
  if (!file) return

  isLoading.value = true
  const reader = new FileReader()

  reader.onload = async (evt) => {
    const data = new Uint8Array(evt.target!.result as ArrayBuffer)
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 })

    const jsonList: { name: string; amount: number; paid?: boolean; confirm?: boolean }[] = []
    for (const row of rows) {
      const name = normalize(row[0] || '')
      const amount = parseInt((row[1] || '').toString().replace(/[^\d]/g, '')) || 0
      if (name && amount) {
        jsonList.push({ name, amount, paid: false, confirm: false })
      }
    }

    const error = await store.insertMembers(jsonList)

    if (error) {
      notify({ type: 'negative', message: '❌ Lỗi khi đẩy lên Supabase', timeout: 2000 })
      console.error('Supabase insert error:', error)
    } else {
      notify({ type: 'positive', message: '✅ Đã import và đẩy lên Supabase', timeout: 1000 })
    }

    await fetchMembers()
    isLoading.value = false
  }

  reader.readAsArrayBuffer(file)
}
</script>


<template>
  <q-layout>
    <q-page-container>
      <!--      add class khi trên 768 thì dùng row, còn dưới 768 thì dùng column-->
            <div class="row row-wrap q-gutter-sm q-mt-sm q-mx-sm">
                <q-uploader label="Import danh sách" accept=".xlsx" @added="onImportExcel" />
<!--                <StatementUpload />-->
            </div>

      <h4 class="q-my-sm">Danh sách đóng tiền</h4>
      <q-separator class="q-my-sm" />

      <q-page>
        <q-table
            :rows="store.people"
            :loading="isLoading"
            :pagination="{ rowsPerPage: 100 }"
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
              },
              {
                name: 'confirm',
                label: 'Quỹ xác nhận',
                align: 'left',
                field: row => row.confirm ? '✅' : '❌',
              }
            ]"
        />

        <!-- Gọi component modal -->
        <PaymentDialog v-model="showDialog" :person="selectedPerson" @refresh="fetchMembers"/>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
