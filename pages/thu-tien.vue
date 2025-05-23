<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import { usePaymentStore } from '~/stores/payment'
import * as XLSX from "xlsx";
import {useQuasar} from "quasar";
const { dialog, bottomSheet, loading, loadingBar, notify, dark, screen } = useQuasar();
import { supabase } from '~/composables/useSupabase'
const store = usePaymentStore()


const qrUrl = computed(() => {
  const base = `https://img.vietqr.io/image/VIB-006365321-compact2.png`
  const params = new URLSearchParams({
    addInfo: name.value
  })
  return `${base}?${params.toString()}`
})

const selectedPerson = ref<{ name: string; amount: number } | null>(null)
const showDialog = ref(false)

const isLoading = ref(false)

function openPaymentModal(row: { name: string; amount: number }) {
  selectedPerson.value = row
  showDialog.value = true
}
const jsonOutput = ref('')
const editableJson = ref('')

onMounted(async () => {
  await fetchMembers()
})


async function fetchMembers() {
  const { data, error } = await store.fetchMembers()
  if (data) {
    jsonOutput.value = JSON.stringify(data, null, 2)
    editableJson.value = JSON.stringify(data, null, 2)
    notify({ type: 'info', message: '📥 Đã tải dữ liệu từ API /api/members' })
  }
  if (error) notify({ type: 'negative', message: '❌ Không thể tải dữ liệu', timeout: 1000 })
}
</script>

<template>
  <q-layout>
    <q-page-container>

      <h4 class="q-my-sm">Dánh sách đóng tiền</h4>
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
