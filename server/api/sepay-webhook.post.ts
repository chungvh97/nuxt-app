import { defineEventHandler, readBody } from 'h3'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yykbeettvbazwlfckcdt.supabase.co' // ← thay bằng của bạn
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5a2JlZXR0dmJhendsZmNrY2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzk2MzgsImV4cCI6MjA2NDc1NTYzOH0.RY3PPn6Yjwl9Eia5mwICtSC3-BqL3VsnMFVkJHdcaYk'    // ← thay bằng của bạn

const supabase = createClient(supabaseUrl, supabaseKey)

// ✅ Hàm normalize bỏ dấu tiếng Việt
function normalize(str: string): string {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
}

export default defineEventHandler(async (event) => {
    try {
        // Đọc body từ webhook gửi lên
        const body = await readBody(event)

        console.log('[SePay Webhook] Nhận dữ liệu:', body)

        // Lấy thông tin cần thiết
        const { transaction_id, amount, status, note } = body

        // Kiểm tra dữ liệu hợp lệ
        if (!note || !amount || status !== 'success') {
            console.warn('[SePay Webhook] Dữ liệu không hợp lệ hoặc chưa thành công')
            return { success: false, message: 'Dữ liệu không hợp lệ hoặc chưa thành công' }
        }

        // Lấy danh sách members từ Supabase
        const { data: members, error: fetchError } = await supabase.from('members').select('*')

        if (fetchError) {
            console.error('Lỗi khi lấy danh sách members:', fetchError)
            throw fetchError
        }

        if (!members || members.length === 0) {
            console.warn('Danh sách members rỗng!')
            return { success: false, message: 'Danh sách members rỗng!' }
        }

        // Tìm member phù hợp
        const matched = members.find(
            (m) =>
                normalize(note).includes(normalize(m.name)) &&
                m.amount === amount
        )

        if (!matched) {
            console.warn(`Không tìm thấy member phù hợp cho note: "${note}" và amount: ${amount}`)
            return { success: false, message: 'Không tìm thấy member phù hợp' }
        }

        // Cập nhật paid = true
        const { error: updateError } = await supabase
            .from('members')
            .update({
                paid: true,
                confirmed_by: 'SePay',
                last_transaction_id: transaction_id
            })
            .eq('id', matched.id)


        if (updateError) {
            console.error('Lỗi khi cập nhật member:', updateError)
            throw updateError
        }

        console.log(`✅ Đã cập nhật trạng thái cho member: ${matched.name}`)

        return {
            success: true,
            message: `✅ Đã cập nhật trạng thái cho member: ${matched.name}`,
            transaction_id,
        }
    } catch (err: any) {
        console.error('❌ Lỗi xử lý webhook:', err)
        return {
            success: false,
            message: 'Lỗi xử lý webhook',
            error: err.message || err,
        }
    }
})
