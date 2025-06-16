// import { defineStore } from 'pinia'
//
// export const usePaymentStore = defineStore('payment', {
//     state: () => ({
//         people: [] as { name: string; amount: number; paid: boolean, confirm: boolean }[]
//     }),
//     actions: {
//         markPaid(name: string, amount: number) {
//             const person = this.people.find(p => p.name === name && p.amount === amount)
//             if (person) person.confirm = true
//         },
//         setPeople: function (people: { name: string; amount: number; paid: boolean, confirm: boolean }[]) {
//             this.people = people
//         }
//     }
// })

// stores/payment.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '~/composables/useSupabase'

export const usePaymentStore = defineStore('payment', () => {
    const people = ref<any[]>([])
    const loading = ref(false)

    async function fetchMembers() {
        loading.value = true
        const { data, error } = await supabase.from('members').select('*').order('name', { ascending: true })
        if (!error) people.value = data || []
        loading.value = false
        return { data, error }
    }

    async function updateMember(id: number, payload: Partial<any>) {
        const { error } = await supabase.from('members').update(payload).eq('id', id)
        return { error }  // ✅ Trả về object
    }

    async function updateConfirmByImport(transactions: { content: string, amount: number }[]) {
        const { data: members } = await supabase.from('members').select('*')
        if (!members) return

        const updated = members.map(member => {
            const match = transactions.find(t => t.content.includes(member.name) && t.amount === member.amount)
            return { ...member, confirm: !!match }
        })

        for (const u of updated) {
            await supabase.from('members').update({ confirm: u.confirm }).eq('id', u.id)
        }

        await fetchMembers()
    }

    async function insertMembers(newItems: any[]) {
        const { error } = await supabase.from('members').upsert(newItems, { onConflict: 'id' })
        if (!error) await fetchMembers()
        return error
    }

    async function bulkUpdateConfirm(updates: { id: number, confirm: boolean }[]) {
        const promises = updates.map(u =>
            supabase.from('members').update({ confirm: u.confirm }).eq('id', u.id)
        )
        const results = await Promise.all(promises)
        await fetchMembers()
        return { error: results.find(r => r.error)?.error }
    }
    async function overwriteMembers(list: any[]) {
        const { error } = await supabase.from('members').upsert(list, { onConflict: 'id' })
        return { error }
    }
    async function upsertMembers(data: any[]) {
        const { data: result, error } = await supabase
            .from('members')
            .upsert(data, {
                onConflict: ['id'], // Vì id là PRIMARY KEY
            })

        return { data: result, error }
    }

    return {
        people,
        loading,
        fetchMembers,
        insertMembers,
        bulkUpdateConfirm,
        overwriteMembers,
        updateMember,
        updateConfirmByImport,
        upsertMembers
    }
})
