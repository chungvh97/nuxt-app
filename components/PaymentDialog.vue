<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  modelValue: boolean
  person: { name: string; amount: number } | null
}>()

const emit = defineEmits(['update:modelValue'])

const currentMonth = dayjs().month() + 1

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
</script>

<template>
  <q-dialog v-model="dialog">
    <q-card style="min-width: 500px">
      <q-card-section class="text-h6">
        Thanh toán cho {{ person?.name }}
      </q-card-section>

      <q-card-section>
        <div><b>Số tiền:</b> {{ person?.amount.toLocaleString() }} VND</div>
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
