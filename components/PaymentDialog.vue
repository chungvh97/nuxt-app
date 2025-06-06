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
    console.log('121')
    waitForPaidStatus()
    checked.value = props.person.paid
  } else {
    checked.value = false
    clearInterval(intervalId)
  }
})

function generateVietQRUrl(name: string, amount: number): string {
  const info = encodeURIComponent(`${name} tháng ${currentMonth}`)
  return `https://qr.sepay.vn/img?acc=VQRQACTIP6004&bank=MBBank&amount=${amount}&des=${info}`
}
let intervalId: any = null
const isWaitingForPaid = ref(false)

function waitForPaidStatus() {
  if (!props.person?.id) return
  isWaitingForPaid.value = true

  intervalId = setInterval(async () => {
    const { data, error } = await store.fetchMembers()
    if (error) {
      console.error('Lỗi khi fetch members:', error)
      return
    }

    const updatedPerson = data?.find((m: any) => m.id === props.person?.id)
    if (updatedPerson && updatedPerson.paid) {
      clearInterval(intervalId)
      intervalId = null
      notify({ type: 'positive', message: '✅ Đã nhận thanh toán từ SePay', timeout: 1000 })
      emit('update:modelValue', false)
      emit('refresh')
    }
  }, 3000)
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
