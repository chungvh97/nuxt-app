import { defineEventHandler, getRouterParam, readBody } from 'h3'
import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')
    const updatedFields = await readBody(event)

    if (!id || !updatedFields) {
        return {
            success: false,
            message: 'Thiếu id hoặc dữ liệu cập nhật'
        }
    }

    const filePath = join(process.cwd(), 'public/members.json')

    try {
        const content = await readFile(filePath, 'utf8')
        const members = JSON.parse(content)

        // So sánh kiểu chuỗi để tránh lỗi type
        const index = members.findIndex((m: any) => String(m.id) === String(id))
        if (index === -1) {
            return {
                success: false,
                message: 'Không tìm thấy người dùng với id đã cho'
            }
        }

        // Cập nhật thông tin giữ nguyên các trường cũ
        members[index] = { ...members[index], ...updatedFields }

        await writeFile(filePath, JSON.stringify(members, null, 2), 'utf8')

        return {
            success: true,
            message: 'Cập nhật thành công',
            updated: members[index]
        }

    } catch (error) {
        return {
            success: false,
            message: 'Lỗi xử lý file dữ liệu',
            error: (error as Error).message
        }
    }
})
