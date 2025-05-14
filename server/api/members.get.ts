import { defineEventHandler } from 'h3'
import { readFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async () => {
    try {
        const filePath = join(process.cwd(), 'public/members.json')
        const content = await readFile(filePath, 'utf8')
        const data = JSON.parse(content)
        return data
    } catch (err) {
        return [] // Trả về danh sách rỗng nếu chưa có file
    }
})
