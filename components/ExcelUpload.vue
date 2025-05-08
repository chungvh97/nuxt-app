<script setup lang="ts">
import * as XLSX from 'xlsx'
import { usePaymentStore } from '~/stores/payment'

const store = usePaymentStore()

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target!.result as ArrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const json = XLSX.utils.sheet_to_json(sheet)

    // Convert to proper format
    const mapped = (json as any[]).map(row => ({
      name: row['Tên'] || row['Họ tên'],
      amount: Number(row['Số tiền']),
      paid: false
    }))

    store.setPeople(mapped)
  }
  reader.readAsArrayBuffer(file)
}
</script>

<template>
  <div>
    <q-file filled label="Chọn file Excel" @change="onFileChange" accept=".xlsx,.xls" />
  </div>
</template>
