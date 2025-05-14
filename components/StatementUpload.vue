<script setup lang="ts">
import * as XLSX from 'xlsx'
import { usePaymentStore } from '~/stores/payment'
import {useQuasar} from "quasar";
const { dialog, bottomSheet, loading, loadingBar, notify, dark, screen } = useQuasar();

const emit = defineEmits<{
  (e: 'update:loading', val: boolean): void
}>()

const store = usePaymentStore()

function normalize(str: string): string {
  return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
}

function parseAmount(raw: string): number {
  return parseInt(
      raw?.toString().replace(/\./g, '').replace(/,/g, '').replace(/[^\d]/g, '') || '0'
  )
}

function onFileAdded(files: File[]) {
  const file = files[0]
  if (!file) return

  emit('update:loading', true) // 👉 Bắt đầu loading

  const reader = new FileReader()
  reader.onload = (evt) => {
    try {
      const data = new Uint8Array(evt.target!.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 })

      const headerRowIndex = rows.findIndex(row =>
          row.some(cell => typeof cell === 'string' && normalize(cell).includes('noi dung')) &&
          row.some(cell => typeof cell === 'string' && normalize(cell).includes('ghi co'))
      )

      if (headerRowIndex === -1) {
        alert('❌ Không tìm thấy hàng tiêu đề')
        emit('update:loading', false)
        return
      }

      const headers = rows[headerRowIndex]
      const dataRows = rows.slice(headerRowIndex + 1)

      const normalizedRows = dataRows.map(row => {
        const obj: any = {}
        headers.forEach((header, i) => {
          obj[header] = row[i]
        })
        return obj
      })

      const contentKey = headers.find(key => normalize(key).includes('noi dung') || normalize(key).includes('mo ta'))
      const creditKey = headers.find(key => normalize(key).includes('ghi co'))

      if (!contentKey || !creditKey) {
        alert('❌ Không tìm thấy cột "Nội dung" hoặc "Ghi có"')
        emit('update:loading', false)
        return
      }

      let matchedCount = 0
      normalizedRows.forEach(row => {
        const content = normalize((row[contentKey] || '').toString())
        const creditedAmount = parseAmount(row[creditKey] || '')

        store.people.forEach(person => {
          const isNameMatch = content.includes(normalize(person.name))
          const isAmountMatch = creditedAmount === person.amount
          if (isNameMatch && isAmountMatch) {
            store.markPaid(person.name, person.amount)
            matchedCount++
          }
        })
      })

      // alert(`✅ Đối chiếu xong: ${matchedCount} người đã được đánh dấu là đã đóng tiền.`)
      matchData()
    } catch (err) {
      notify({ type: 'negative', message: '❌ Có lỗi khi đọc file. Vui lòng kiểm tra lại.', timeout: 1000 })
    }

    emit('update:loading', false) // 👉 Kết thúc loading
  }

  reader.readAsArrayBuffer(file)
}

async function matchData () {
  try {

    await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store.people)
    })

    notify({ type: 'positive', message: '✅ Đã cập nhật trạng thái confirm', timeout: 1000 })
  } catch (err) {
    notify({ type: 'negative', message: '❌ Lỗi xử lý khi đối chiếu', timeout: 1000 })
  }

}
</script>

<template>
  <q-uploader
      label="Tải sao kê VietQR (.xlsx)"
      accept=".xlsx"
      :auto-upload="false"
      @added="onFileAdded"
      filled
  />
</template>
