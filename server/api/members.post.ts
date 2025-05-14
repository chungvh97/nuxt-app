import { defineEventHandler, readBody } from 'h3'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    const members = await readBody(event)
    const filePath = join(process.cwd(), 'public/members.json')
    await writeFile(filePath, JSON.stringify(members, null, 2), 'utf8')
    return { success: true, count: members.length }
})
