<script setup lang="ts">
import * as XLSX from 'xlsx'
import { usePaymentStore } from '~/stores/payment'
import { useQuasar } from 'quasar'

const store = usePaymentStore()
const $q = useQuasar()

function normalize(str: string): string {
  return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
}

async function onImportVietQR(files: File[]) {
  const file = files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (evt) => {
    const data = new Uint8Array(evt.target!.result as ArrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 })

    const headerRowIndex = rows.findIndex(row =>
        row.some(cell => typeof cell === 'string' && normalize(cell).includes('noi dung')) &&
        row.some(cell => typeof cell === 'string' && normalize(cell).includes('ghi co'))
    )

    if (headerRowIndex === -1) {
      alert('❌ Không tìm thấy hàng tiêu đề chứa "Nội dung" và "Ghi có"')
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
      return
    }

    const transactions = normalizedRows.map(row => ({
      content: normalize((row[contentKey] || '').toString()),
      amount: parseInt((row[creditKey] || '').toString().replace(/[^\d]/g, '') || '0')
    }))

    const updatedMembers = store.people.map(member => {
      const matched = transactions.find(t =>
          t.content.includes(normalize(member.name)) && t.amount === member.amount
      )
      return {
        ...member,
        paid: matched ? true : member.paid,
        confirm: matched ? true : member.confirm,
        user: matched ? 'VietQR' : member.confirmed_by
      }
    })

    const { error } = await store.overwriteMembers(updatedMembers)
    if (!error) {
      $q.notify({ type: 'positive', message: '✅ Đã đối chiếu và cập nhật toàn bộ danh sách', timeout: 1000 })
      await store.fetchMembers()
    } else {
      $q.notify({ type: 'negative', message: '❌ Lỗi khi cập nhật Supabase', timeout: 1000 })
    }
  }

  reader.readAsArrayBuffer(file)
}
</script>

<template>
  <q-uploader
      label="📥 Tải sao kê VietQR (.xlsx)"
      accept=".xlsx"
      :auto-upload="false"
      @added="onImportVietQR"
      filled
  />
</template>
