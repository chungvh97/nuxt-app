// stores/payment.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '~/composables/useSupabase'

export const usePaymentStore = defineStore('payment', () => {
    const people = ref<any[]>([])
    const loading = ref(false)

    async function fetchMembers(nameGroup?: string) {
        loading.value = true
        // query theo nameGroup nếu có
        const query = supabase.from('members').select('*').order('name', { ascending: true })
        if (nameGroup) {
            query.eq('group', nameGroup)
        }
        const { data, error } = await query
            .order('name', { ascending: true })

        if (!error) people.value = data.map((ite,idx) => {
            ite.index = idx + 1 // thêm index vào mỗi item
            return ite
        }) || []

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

    async function insertMembers(list: any[]) {
        // const { error } = await supabase
        //     .from('members')
        //     .upsert(list, {
        //         onConflict: ['name'], // 💡 bạn cần có UNIQUE constraint trên 2 cột này
        //     })
        //
        // return error

        const { data: members } = await supabase.from('members').select('*')
        if (!members) return

        const updated = members.map(member => {
            if (!member.name || !member.amount) return member // Bỏ qua nếu không có name hoặc amount
            const match = list.find(t => (t.name === member.name) && (t.amount === member.amount))
            console.log(match, member.name, member.amount)
            return { ...member, confirm: !!match }
        })

        for (const u of updated) {
            await supabase.from('members').update({ confirm: u.confirm }).eq('id', u.id)
        }



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
                onConflict: ['name'], // Vì id là PRIMARY KEY
                ignoreDuplicates: false
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
