<script setup lang="ts">
import {usePaymentStore} from "~/stores/payment";
import {normalize, openWindow, parseNumber} from "~/composables/fnCommon";
import {useQuasar} from "quasar";
import constant from "~/composables/common";

const {notify} = useQuasar()

const store = usePaymentStore()

// Call đến API để lấy dữ liệu từ Google Sheets
const {data, pending, error} = useFetch('/api/sheets');

const props = defineProps({
  activeGroup: {
    type: String,
    required: true,
    default: 'FE'
  }
})

// kiểm tra xem có dữ liệu chưa, nếu có thì call store.insertMembers
watch(data, async (newData) => {
  if (newData && newData.rows.length > 0) {
    const jsonList: { name: string; amount: number; paid?: boolean; confirm?: boolean }[] = []

    for (const row of newData?.rows) {
      const name = normalize(row['họ_tên'] || '')
      const amount = parseNumber(row['tổng_tiền_cần_đóng'] || '0')
      if (name && amount) {
        jsonList.push({
          name,
          group: row['nhóm'],
          'violations_month': parseNumber(row['tiền_phạt_tháng_trước']),
          'violations_card': parseNumber(row['phạt_quên_đeo_thẻ']),
          amount,
          paid: false,
          confirm: false
        })
      }

      console.log(row)
      // Case onsite & special
      if (name && (row['tổng_tiền_cần_đóng'] === '0')) {
        jsonList.push({
          name,
          amount,
          group: row['nhóm'],
          'violations_month': parseNumber(row['tiền_phạt_tháng_trước']),
          'violations_card': parseNumber(row['phạt_quên_đeo_thẻ']),
          paid: true,
          confirm: true
        })
      }
    }

    const error = await store.insertMembers(jsonList)

    if (error) {
      notify({type: 'negative', message: '❌ Lỗi khi đẩy lên Supabase', timeout: 2000})
      console.error('Supabase insert error:', error)
    } else {
      notify({type: 'positive', message: '✅ Đã import và đẩy lên Server', timeout: 1000})
    }
  }
}, {immediate: true});

</script>

<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          <q-avatar>
            <img src="https://cdn.quasar.dev/logo-v2/svg/logo-mono-white.svg">
          </q-avatar>
          Ứng dụng thu tiền quỹ hàng tháng
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div v-if="pending" class="text-center">
          <q-spinner-dots color="primary" size="40px"/>
          <p>Đang tải dữ liệu từ máy chủ...</p>
        </div>
        <div v-else-if="error" class="text-center text-negative">
          <p>Đã xảy ra lỗi: {{ error.data?.statusMessage || error.message }}</p>
        </div>
        <div v-else-if="data">
          <TableMember :nameGroup="props.activeGroup"/>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
