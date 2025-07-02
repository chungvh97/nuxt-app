// File: server/api/sheets.ts

import { google } from 'googleapis';
import path from 'path';

export default defineEventHandler(async (event) => {
    // Lấy ID trang tính từ biến môi trường
    const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID || '1Yl1KWVO7fpopz8YxKODGWqBv6ytyxoaQA9OhdFux5IM';
    const SHEET_NAME = 'ThuTiền_Tool'; // Hoặc tên trang tính của bạn

    try {
        let auth;
        if (process.env.GOOGLE_CREDENTIALS_JSON) {
            // 1. Đọc chuỗi JSON từ biến môi trường
            const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
            if (!credentialsJson) {
                throw new Error('Google credentials JSON is not set in environment variables');
            }

            // 2. Chuyển chuỗi JSON thành object
            const credentials = JSON.parse(credentialsJson);

            // Tạo đối tượng xác thực
            auth = new google.auth.GoogleAuth({
                // Chỉ định đường dẫn đến tệp khóa JSON
                credentials, // <--- Thay đổi ở đây
                // Chỉ định phạm vi (scope) cần thiết. 'spreadsheets' cho phép cả đọc và ghi.
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } else {
            auth = new google.auth.GoogleAuth({
                // Chỉ định đường dẫn đến tệp khóa JSON
                keyFile: path.join(process.cwd(), 'google-credentials.json'),
                // Chỉ định phạm vi (scope) cần thiết. 'spreadsheets' cho phép cả đọc và ghi.
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        }

        // Tạo một client đã được xác thực
        const sheets = google.sheets({ version: 'v4', auth });

        // Gọi API để lấy dữ liệu
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}`, // Lấy toàn bộ dữ liệu trong trang
        });

        const values = response.data.values;
        if (!values || values.length < 2) {
            return { columns: [], rows: [] };
        }

        // Xử lý dữ liệu (giống như trước đây, nhưng giờ ở trên server)
        const header = values[0];
        const dataRows = values.slice(1);

        const formattedColumns = header.map((colName: string) => ({
            name: colName.toLowerCase().replace(/\s+/g, '_'),
            label: colName,
            field: colName.toLowerCase().replace(/\s+/g, '_'),
            align: 'left',
            sortable: true,
        }));

        const formattedRows = dataRows.map((row: any[]) => {
            const rowObject: { [key: string]: any } = {};
            header.forEach((colName: string, index: number) => {
                const fieldName = colName.toLowerCase().replace(/\s+/g, '_');
                rowObject[fieldName] = row[index] || '';
            });
            return rowObject;
        });

        // sort lại dữ liệu
        const listName = ['stt', 'họ_tên', 'nhóm', 'tiền_phạt_tháng_trước', 'tiền_quỹ', 'tổng_tiền_cần_đóng', 'đã_đóng'];
        let listColumns = []
        formattedColumns?.forEach((ite,idx) => {
            if (listName.includes(ite.name)) {
                // kiểm tra ite.name đã có trong listName chưa, chưa có thì thêm vào
                if (!listColumns.some(col => col.name === ite.name)) {
                    listColumns.push(ite);
                }
            }
        })

        // sắp xếp lại listColumns theo thứ tự listName
        listColumns.sort((a, b) => {
            return listName.indexOf(a.name) - listName.indexOf(b.name);
        });


        // store.insertMembers



        // Trả về dữ liệu đã được định dạng
        return {
            columns: listColumns,
            rows: formattedRows,
        };

    } catch (error) {
        console.error('Lỗi khi kết nối đến Google Sheets API:', error);
        // Ném lỗi để Nuxt có thể xử lý
        throw createError({
            statusCode: 500,
            statusMessage: 'Không thể lấy dữ liệu từ Google Sheets',
        });
    }
});
