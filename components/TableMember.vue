<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {usePaymentStore} from '~/stores/payment'
import constant from "~/composables/common";
import {useQuasar} from "quasar";

const {notify} = useQuasar();
const store = usePaymentStore()

const props = defineProps({nameGroup: String})

const selectedPerson = ref<{ name: string; amount: number } | null>(null)
const showDialog = ref(false)

const isLoading = ref(false)

function openPaymentModal(row: { name: string; amount: number }) {
  if (row && row.paid) return;
  selectedPerson.value = row
  showDialog.value = true
}

onMounted(async () => {
  await fetchMembers()
})

async function fetchMembers() {
  const {data, error} = await store.fetchMembers(props.nameGroup)
  if (data) {
    notify({type: 'info', message: '📥 Load dữ liệu thành công'})
  }
  if (error) notify({type: 'negative', message: '❌ Không thể tải dữ liệu', timeout: 1000})
}

const totalAmount = computed(() =>
    store.people.reduce((sum, p) => sum + (p.amount || 0), 0)
)

const totalCollected = computed(() =>
    store.people
        .filter(p => p.paid)
        .reduce((sum, p) => sum + (p.amount || 0), 0)
)

const totalViolate = computed(() =>
    store.people.reduce((sum, p) => sum + (p.violations_month || 0) + (p.violations_card || 0), 0)
)
</script>

<template>
  <q-layout>

    <q-page-container>
      <h4 class="q-my-sm">Danh sách đóng tiền</h4>
      <div class="flex justify-between items-center">
        <q-btn
            color="secondary"
            label="Xem dữ liệu từ Google Sheet"
            @click="openWindow(constant.linkSheet)"
        />
        <div class="text-right q-pa-sm">
          <div><b>Tổng số tiền phạt:</b> {{ totalViolate.toLocaleString('vi-VN') }} VND</div>
          <div><b>Tổng số tiền cần thu:</b> {{ totalAmount.toLocaleString('vi-VN') }} VND</div>
          <div><b>Đã thu:</b> {{ totalCollected.toLocaleString('vi-VN') }} VND</div>
        </div>
      </div>
      <q-separator class="q-my-sm"/>

      <q-table
          flat bordered
          :rows="store.people"
          :loading="isLoading"
          :pagination="{ rowsPerPage: 100 }"
          virtual-scroll
          row-key="index"
          @row-click="(_, row) => openPaymentModal(row)"
          :columns="[
          { name: 'index', label: 'ID', field: 'index', align: 'center', style: 'width: 70px' },
          { name: 'name', label: 'Họ tên', field: 'name', align: 'left' },
          { name: 'group', label: 'Nhóm', field: 'group', align: 'center', style: 'width: 100px' },
          { name: 'violations_month', label: 'Phạt tháng trước', field: 'violations_month', align: 'center', format: val => `${val.toLocaleString('vi-VN')}`, style: 'width: 120px' },
          { name: 'violations_card', label: 'Phạt quên đeo thẻ', field: 'violations_card', align: 'center', format: val => `${val.toLocaleString('vi-VN')}`, style: 'width: 120px' },
          {
            name: 'amount',
            label: 'Số tiền cần đóng',
            field: 'amount',
            align: 'center',
            format: val => `${val.toLocaleString('vi-VN')}`,
            style: 'width: 120px'
          },
          {
            name: 'paid',
            label: 'Đã đóng',
            field: row => row.paid ? '✅' : '❌',
            align: 'center',
            style: 'width: 150px'
          },
        ]"
      />

      <!-- Gọi component modal -->
      <PaymentDialog v-model="showDialog" :person="selectedPerson" :nameGroup="nameGroup" @refresh="fetchMembers"/>
    </q-page-container>
  </q-layout>
</template>
