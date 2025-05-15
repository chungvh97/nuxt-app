<script setup lang="ts">
import { computed, defineProps, defineEmits, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useQuasar } from 'quasar'
import { usePaymentStore } from '~/stores/payment'

const { notify } = useQuasar()
const store = usePaymentStore()

const props = defineProps<{
  modelValue: boolean
  person: { id: number, name: string; amount: number, paid: boolean, confirm: boolean } | null
}>()

const emit = defineEmits(['update:modelValue', 'refresh'])

const currentMonth = dayjs().month() + 1
const checked = ref(false)

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

watch(() => props.modelValue, (val) => {
  if (val && props.person) {
    checked.value = props.person.paid
  } else {
    checked.value = false
  }
})

function generateVietQRUrl(name: string, amount: number): string {
  const bankId = 'VIB'
  const accountNo = '006365321'
  const info = encodeURIComponent(`${name} tháng ${currentMonth} ${amount}VNĐ`)
  return `https://img.vietqr.io/image/${bankId}-${accountNo}-print.png?amount=${amount}&addInfo=${info}`
}

async function onChecked(val: boolean) {
  if (!props?.person?.id) return
  try {
    const updated = {
      ...props.person,
      paid: val,
    }
    const { error } = await store.updateMember(props.person.id, updated)
    if (error) throw error

    notify({ type: 'positive', message: '✅ Đã xác nhận thanh toán', timeout: 1000 })
    emit('update:modelValue', false)
    emit('refresh')
  } catch (err) {
    notify({ type: 'negative', message: '❌ Lỗi khi lưu dữ liệu', timeout: 1000 })
  }
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
