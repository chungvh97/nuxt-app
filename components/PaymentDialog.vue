<script setup lang="ts">
import { computed, defineProps, defineEmits, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { useQuasar } from 'quasar'
import { usePaymentStore } from '~/stores/payment'

const { notify } = useQuasar()
const store = usePaymentStore()

const props= defineProps({
  modelValue: Boolean,
  person: {
    type: Object as () => { id: number, name: string; amount: number, paid: boolean, confirm: boolean } | null,
    default: null
  },
  nameGroup: {
    type: String,
    required: true,
    default: 'FE'
  }
})

const emit = defineEmits(['update:modelValue', 'refresh'])

const currentMonth = dayjs().month() + 1
const checked = ref(false)
const isWaitingForPaid = ref(false)
let intervalId: any = null

const dialog = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

watch(() => props.modelValue, (val) => {
  if (val && props.person) {
    // Khi mở dialog → bắt đầu đợi paid
    checked.value = props.person.paid
    startWaitingForPaid()
  } else {
    // Khi đóng dialog → clear interval
    checked.value = false
    stopWaitingForPaid()
  }
})

const iBank = reactive({
  'FE' : {
    acc: 'VQRQACTIP6004',
    bank: 'MBBank',
  },
  'BE': {
    acc: 'SEPHKH130894',
    bank: 'OCB',
  }
})

function generateVietQRUrl(name: string, amount: number): string {
  const info = encodeURIComponent(`${name} tháng ${currentMonth}`)
  return `https://qr.sepay.vn/img?acc=${iBank[props.nameGroup].acc}&bank=${iBank[props.nameGroup].bank}&amount=${amount}&des=${info}`
}

function startWaitingForPaid() {
  if (!props.person?.id) return
  if (intervalId) return // tránh chạy nhiều interval

  isWaitingForPaid.value = true

  intervalId = setInterval(async () => {
    const { data, error } = await store.fetchMembers(props.nameGroup)
    if (error) {
      console.error('Lỗi khi fetch members:', error)
      return
    }

    const updatedPerson = data?.find((m: any) => m.id === props.person?.id)
    if (updatedPerson && updatedPerson.paid) {
      stopWaitingForPaid()
      notify({ type: 'positive', message: '✅ Đã nhận thanh toán', timeout: 1000 })
      emit('update:modelValue', false) // đóng dialog
      emit('refresh') // refresh list
    }
  }, 3000)
}

function stopWaitingForPaid() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
    isWaitingForPaid.value = false
  }
}
</script>

<template>
  <q-dialog v-model="dialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="text-h6">
        Tên đóng quỹ: {{ person?.name }} - {{props.nameGroup}}
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

        <div class="q-mt-md text-center text-blue" v-if="isWaitingForPaid">
          <q-spinner size="30px" color="primary" />
          <div class="q-mt-sm">Đang chờ xác nhận từ SePay...</div>
        </div>
      </q-card-section>

<!--      <q-card-actions align="right">-->
<!--        <q-btn flat label="Đóng" color="primary" v-close-popup />-->
<!--      </q-card-actions>-->
    </q-card>
  </q-dialog>
</template>
