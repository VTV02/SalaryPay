import * as xlsx from 'xlsx';
import path from 'path';

// ===== Template 1: Danh sách nhân viên =====
const empHeaders = ['Mã Nhân Viên', 'Họ Tên', '6 Số CCCD'];
const empSample = [
  ['25023492', 'VÕ VĂN TRUNG', '123456'],
  ['25023001', 'NGUYỄN VĂN A', '654321'],
];

const empWs = xlsx.utils.aoa_to_sheet([empHeaders, ...empSample]);
empWs['!cols'] = [{ wch: 16 }, { wch: 25 }, { wch: 14 }];
const empWb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(empWb, empWs, 'Nhân viên');
xlsx.writeFile(empWb, path.join(__dirname, '..', 'public', 'templates', 'mau-nhan-vien.xlsx'));

// ===== Template 2: Bảng lương tháng =====
const salHeaders = [
  'Mã Nhân Viên',
  'Chức vụ',
  'Phòng ban',
  'Địa chỉ mail',
  'Đơn vị tính',
  'Tỷ giá USD/VNĐ',
  'Lương thu nhập',
  'Lương Cơ Bản',
  'Ngày công chuẩn/tháng',
  'Ngày công làm việc thực tế',
  'Lương ngày công làm việc thực tế',
  'Ngày công làm việc ngày Lễ/Tết',
  'Lương làm việc ngày Lễ/Tết',
  'Ngày công nghỉ Lễ/Tết/NB',
  'Lương ngày nghỉ Lễ/Tết/Nghỉ bù',
  'Ngày công nghỉ Chế độ',
  'Lương ngày nghỉ Chế độ',
  'Giờ tăng ca',
  'Lương tăng ca',
  'Truy lĩnh',
  'Diễn giải truy lĩnh',
  'Quà 8/3',
  'Chi phí về phép/ vé máy bay',
  'Số tiền đã ứng',
  'Truy thu',
  'Diễn giải truy thu',
  'Tang chế Kỳ 1',
  'Tổng lương thu nhập',
  'Tổng giảm trừ',
  'Thực Lãnh',
];

const salSample = [
  [
    '25023492',
    'Phụ trách bộ phân vận hành',
    'P. Chuyển đổi số',
    'vovantrungphone2002@gmail.com',
    'USD',
    '26,078',
    498.5,
    '',
    26.0,
    13.0,
    249.25,
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    '-',
    249.25,
    '-',
    249.25,
  ],
];

const salWs = xlsx.utils.aoa_to_sheet([salHeaders, ...salSample]);
salWs['!cols'] = salHeaders.map((h) => ({ wch: Math.max(h.length + 4, 14) }));
const salWb = xlsx.utils.book_new();
xlsx.utils.book_append_sheet(salWb, salWs, 'Bảng lương');
xlsx.writeFile(salWb, path.join(__dirname, '..', 'public', 'templates', 'mau-bang-luong.xlsx'));

console.log('Đã tạo templates trong public/templates/');
