<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import dayjs from 'dayjs'
import {useQuasar} from "quasar";
const { bottomSheet, loading, loadingBar, notify, dark, screen } = useQuasar();

const props = defineProps<{
  modelValue: boolean
  person: {id: number, name: string; amount: number, paid: boolean, confirm: boolean } | null
}>()


const emit = defineEmits(['update:modelValue', 'refresh'])

const currentMonth = dayjs().month() + 1
const checked = ref(false)
const data = computed(() => props.person)
const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

function generateVietQRUrl(name: string, amount: number): string {
  const bankId = 'VIB' // Ví dụ: Techcombank
  const accountNo = '006365321' // Số tài khoản của bạn
  const info = encodeURIComponent(`${name} tháng ${currentMonth} ${amount}VNĐ`)
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${amount}&addInfo=${info}`
}
async function onChecked(val: boolean) {
  if (!props?.person?.id) return
  try {
    const res = await fetch(`/api/members/${props.person.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({...props.person, paid: val})
    })
    if (!res.ok) throw new Error()
    notify({timeout:1000, type: 'positive', message: '✅ Đã xác nhận thanh toán' })
    emit('update:modelValue', false)
    emit('refresh')
  } catch (err) {
    notify({timeout:1000, type: 'negative', message: '❌ Lỗi khi lưu dữ liệu' })
  }
}

function updateList(updatedEntry: any) {
  const oldList = JSON.parse(localStorage.getItem('members') || '[]')
  const updated = oldList.map((m: any) => m.id === updatedEntry.id ? updatedEntry : m)
  localStorage.setItem('members', JSON.stringify(updated))
  return updated
}
</script>

<template>
  <q-dialog v-model="dialog">
    <q-card style="min-width: 500px">
      <q-card-section class="text-h6">
        Thanh toán cho {{ person?.name }}
      </q-card-section>

      <q-card-section>
        <div><b>Số tiền:</b> {{ person?.amount.toLocaleString() }} VND</div>
        <q-checkbox @update:model-value="onChecked" v-model="checked" label="Xác nhận đã thanh toán" class="q-mt-md" />
        <div class="q-mt-md text-center">
          <img
              :src="generateVietQRUrl(person?.name || '', person?.amount || 0)"
              alt="QR Code"
              style="width: 350px; height: auto;"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Đóng" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
