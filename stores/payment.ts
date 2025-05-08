import { defineStore } from 'pinia'

export const usePaymentStore = defineStore('payment', {
    state: () => ({
        people: [] as { name: string; amount: number; paid: boolean }[]
    }),
    actions: {
        markPaid(name: string, amount: number) {
            const person = this.people.find(p => p.name === name && p.amount === amount)
            if (person) person.paid = true
        },
        setPeople: function (people: { name: string; amount: number; paid: boolean }[]) {
            this.people = people
        }
    }
})
