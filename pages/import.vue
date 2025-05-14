<script setup lang="ts">
import * as XLSX from 'xlsx'
import { ref } from 'vue'

const htmlOutput = ref('')
const htmlAltOutput = ref('')

function normalize(str: string): string {
  return str
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
}

function handleExcelStructure(files: File[], mode: 'block' | 'alt') {
  const file = files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target!.result as ArrayBuffer)
    const workbook = XLSX.read(data, { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const df = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 })

    const columns: string[][] = []
    for (let col = 0; col < df[0].length; col++) {
      const columnData: string[] = []
      for (let row = 0; row < df.length; row++) {
        columnData.push(df[row][col])
      }
      columns.push(columnData.filter(v => !!v))
    }

    const maxItems = Math.max(...columns.map(col => col.length))
    let resultHtml = ''

    if (mode === 'block') {
      for (let i = 0; i < maxItems; i += 2) {
        resultHtml += '<div class="main__list main__list--bg">\n'
        for (let col = 0; col < columns.length; col++) {
          const title = normalize(columns[col][i] || '')
          const desc = normalize(columns[col][i + 1] || '')
          if (!title || !desc) continue

          resultHtml += `  <div class="main__list--bg__item">\n    <div class="_inner">\n      <p class="title"><b>${title}</b></p>\n      <p>${desc}</p>\n    </div>\n  </div>\n`
        }
        resultHtml += '</div>\n\n'
      }
      htmlOutput.value = resultHtml
    } else if (mode === 'alt') {
      for (let col = 0; col < columns.length; col++) {
        resultHtml += '<div class="list__item">\n'
        for (let i = 0; i < columns[col].length; i += 2) {
          const title = normalize(columns[col][i] || '')
          const desc = normalize(columns[col][i + 1] || '')
          if (!title || !desc) continue

          resultHtml += `  <div class="bg-gray">\n    <h4>${title}</h4>\n    <p>${desc}</p>\n  </div>\n`
        }
        resultHtml += '</div>\n\n'
      }
      htmlAltOutput.value = resultHtml
    }
  }

  reader.readAsArrayBuffer(file)
}
</script>

<template>
  <div class="q-pa-md">
    <q-uploader
        label="Chọn file (kiểu main__list)"
        accept=".xlsx"
        :auto-upload="false"
        @added="files => handleExcelStructure(files, 'block')"
        filled
    />

    <q-uploader
        label="Chọn file (kiểu list__item)"
        accept=".xlsx"
        :auto-upload="false"
        @added="files => handleExcelStructure(files, 'alt')"
        filled
        class="q-mt-md"
    />

    <div class="q-mt-lg">
      <pre>{{ htmlOutput }}</pre>
      <pre>{{ htmlAltOutput }}</pre>
    </div>
  </div>
</template>

<style scoped>
.main__list--bg {
  border: 1px solid #ddd;
  padding: 10px;
  margin-bottom: 20px;
}
.main__list--bg__item {
  margin-bottom: 10px;
}
.title b {
  font-weight: bold;
}
.bg-gray {
  background-color: #f0f0f0;
  padding: 12px;
  margin-bottom: 10px;
}
.list__item {
  margin-bottom: 24px;
}
</style>
