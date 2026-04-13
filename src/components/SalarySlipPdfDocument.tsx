import path from 'path';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import type { SalarySlipViewProps } from '@/components/SalarySlipView';

const fontsDir = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: path.join(fontsDir, 'NotoSans-Regular.ttf'), fontWeight: 'normal', fontStyle: 'normal' },
    { src: path.join(fontsDir, 'NotoSans-Regular.ttf'), fontWeight: 'normal', fontStyle: 'italic' },
    { src: path.join(fontsDir, 'NotoSans-Regular.ttf'), fontWeight: 'bold', fontStyle: 'normal' },
    { src: path.join(fontsDir, 'NotoSans-Regular.ttf'), fontWeight: 'bold', fontStyle: 'italic' },
  ],
});
Font.register({
  family: 'Battambang',
  fonts: [
    { src: path.join(fontsDir, 'Battambang-Regular.ttf'), fontWeight: 'normal', fontStyle: 'normal' },
    { src: path.join(fontsDir, 'Battambang-Regular.ttf'), fontWeight: 'normal', fontStyle: 'italic' },
    { src: path.join(fontsDir, 'Battambang-Regular.ttf'), fontWeight: 'bold', fontStyle: 'normal' },
    { src: path.join(fontsDir, 'Battambang-Regular.ttf'), fontWeight: 'bold', fontStyle: 'italic' },
  ],
});

/* ── Label maps ── */
const LABEL_EN: Record<string, string> = {
  'Ngày công chuẩn/tháng': 'Standard Working Days/Mo',
  'Ngày công làm việc thực tế': 'Actual Working Days',
  'Lương ngày công làm việc thực tế': 'Actual Working Days Salary',
  'Lương nghỉ nhật': 'Sunday Rest Salary',
  'Ngày công nghỉ nhật': 'Sunday Rest Days',
  'Lương ngày nghỉ phép': 'Annual Leave Salary',
  'Ngày công nghỉ phép': 'Annual Leave Days',
  'Lương ngày nghỉ Thứ 7': 'Saturday Salary',
  'Ngày công nghỉ Thứ 7': 'Saturday Days',
  'Lương làm việc ngày Lễ/Tết': 'Holiday Salary',
  'Ngày công làm việc ngày Lễ/Tết': 'Holiday Working Days',
  'Lương ngày nghỉ Lễ/Tết/Nghỉ bù': 'Paid Leave Salary',
  'Ngày công nghỉ Lễ/Tết/NB': 'Paid Leave Days',
  'Lương ngày LVTN/Nghỉ bù': 'Comp Leave Salary',
  'Ngày công LVTN/NB': 'Comp Leave Days',
  'Lương ngày nghỉ Chế độ': 'Welfare Leave Salary',
  'Ngày công nghỉ Chế độ': 'Welfare Leave Days',
  'Giờ tăng ca': 'Overtime Hours',
  'Lương tăng ca': 'Overtime Salary',
  'Giờ bổ tăng ca': 'Additional OT Hours',
  'Lương bổ tăng ca': 'Additional OT Salary',
  'Truy lĩnh': 'Arrears',
  'Diễn giải truy lĩnh': 'Arrears Note',
  'Phụ cấp Chức danh': 'Position Allowance',
  'Phụ cấp xăng xe': 'Gas Allowance',
  'Phụ cấp ăn ca': 'Meal Allowance',
  'Phụ cấp điện thoại': 'Phone Allowance',
  'Phụ cấp Kiêm nhiệm': 'Concurrent Duty Allowance',
  'Thưởng chuyên cần': 'Attendance Bonus',
  'Quà 8/3': 'Holiday Gift',
  'Quà sinh nhật/thuật lễ': 'Birthday/Ceremony Gift',
  'Chi phí về phép/ vé máy bay': 'Flight Ticket / Vacation',
  'Bảo hiểm xã hội CCPC': 'Social Insurance',
  'Thuế thu nhập': 'Income Tax',
  'Tiền ăn': 'Meal Deduction',
  'Tiền điện nước': 'Utilities',
  'Số tiền đã ứng': 'Advanced Payment',
  'Tạm ứng lương Kỳ 1': 'Phase 1 Advance',
  'Truy thu': 'Deduction',
  'Diễn giải truy thu': 'Deduction Note',
  'Tang chế': 'Funeral Allowance',
  'Quỹ sinh nhật': 'Birthday Fund',
  'Phụ cấp ĐDCĐ': 'Union Allowance',
};

const LABEL_KM: Record<string, string> = {
  'Ngày công chuẩn/tháng': 'ថ្ងៃធ្វើការស្តង់ដារ',
  'Ngày công làm việc thực tế': 'ថ្ងៃធ្វើការជាក់ស្តែង',
  'Lương ngày công làm việc thực tế': 'ប្រាក់ខែថ្ងៃធ្វើការជាក់ស្តែង',
  'Lương nghỉ nhật': 'ប្រាក់ខែថ្ងៃអាទិត្យ',
  'Ngày công nghỉ nhật': 'ថ្ងៃឈប់សម្រាកអាទិត្យ',
  'Lương ngày nghỉ phép': 'ប្រាក់ខែឈប់សម្រាកប្រចាំឆ្នាំ',
  'Ngày công nghỉ phép': 'ថ្ងៃឈប់សម្រាកប្រចាំឆ្នាំ',
  'Lương ngày nghỉ Thứ 7': 'ប្រាក់ខែថ្ងៃសៅរ៍',
  'Ngày công nghỉ Thứ 7': 'ថ្ងៃសៅរ៍',
  'Lương làm việc ngày Lễ/Tết': 'ប្រាក់ខែថ្ងៃឈប់សម្រាក',
  'Ngày công làm việc ngày Lễ/Tết': 'ថ្ងៃធ្វើការថ្ងៃឈប់សម្រាក',
  'Lương ngày nghỉ Lễ/Tết/Nghỉ bù': 'ប្រាក់បៀវត្សរ៍សម្រាក',
  'Ngày công nghỉ Lễ/Tết/NB': 'ថ្ងៃឈប់សម្រាក',
  'Lương ngày LVTN/Nghỉ bù': 'ប្រាក់ខែឈប់សម្រាកជំនួស',
  'Ngày công LVTN/NB': 'ថ្ងៃឈប់សម្រាកជំនួស',
  'Lương ngày nghỉ Chế độ': 'ប្រាក់ខែសម្រាកសុខុមាលភាព',
  'Ngày công nghỉ Chế độ': 'ថ្ងៃឈប់សម្រាកសុខុមាលភាព',
  'Giờ tăng ca': 'ម៉ោងថែមម៉ោង',
  'Lương tăng ca': 'ប្រាក់បៀវត្សរ៍ថែមម៉ោង',
  'Giờ bổ tăng ca': 'ម៉ោងថែមម៉ោងបន្ថែម',
  'Lương bổ tăng ca': 'ប្រាក់បៀវត្សរ៍ថែមម៉ោងបន្ថែម',
  'Truy lĩnh': 'ប្រាក់ជំពាក់',
  'Diễn giải truy lĩnh': 'កំណត់ចំណាំប្រាក់ជំពាក់',
  'Phụ cấp Chức danh': 'ប្រាក់ឧបត្ថម្ភមុខតំណែង',
  'Phụ cấp xăng xe': 'ប្រាក់ឧបត្ថម្ភសាំង',
  'Phụ cấp ăn ca': 'ប្រាក់ឧបត្ថម្ភអាហារ',
  'Phụ cấp điện thoại': 'ប្រាក់ឧបត្ថម្ភទូរស័ព្ទ',
  'Phụ cấp Kiêm nhiệm': 'ប្រាក់ឧបត្ថម្ភការងារស្របពេល',
  'Thưởng chuyên cần': 'ប្រាក់រង្វាន់វត្តមាន',
  'Quà 8/3': 'អំណោយថ្ងៃឈប់សម្រាក',
  'Quà sinh nhật/thuật lễ': 'អំណោយខួបកំណើត/ពិធី',
  'Chi phí về phép/ vé máy bay': 'សំបុត្រយន្តហោះ/វិស្សមកាល',
  'Bảo hiểm xã hội CCPC': 'ធានារ៉ាប់រងសង្គម',
  'Thuế thu nhập': 'ពន្ធលើប្រាក់ចំណូល',
  'Tiền ăn': 'កាត់ប្រាក់អាហារ',
  'Tiền điện nước': 'ទឹកភ្លើង',
  'Số tiền đã ứng': 'ប្រាក់កក់ដែលបានបង់',
  'Tạm ứng lương Kỳ 1': 'ប្រាក់កក់វគ្គ១',
  'Truy thu': 'ការកាត់ប្រាក់',
  'Diễn giải truy thu': 'កំណត់ចំណាំការកាត់',
  'Tang chế': 'ប្រាក់ឧបត្ថម្ភបុណ្យសព',
  'Quỹ sinh nhật': 'មូលនិធិខួបកំណើត',
  'Phụ cấp ĐDCĐ': 'ប្រាក់ឧបត្ថម្ភសហជីព',
};

const B = '#c5d3e8';
const BH = '#9fb8da';

const s = StyleSheet.create({
  page: { fontFamily: 'NotoSans', fontSize: 8, padding: 30, color: '#1e293b' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logoArea: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 36, height: 36, marginRight: 8 },
  companyName: { fontSize: 11, fontWeight: 'bold' },
  dateLabel: { fontSize: 8, textAlign: 'right', color: '#475569', fontStyle: 'italic' },
  titleBlock: { textAlign: 'center', marginBottom: 10, marginTop: 4 },
  titleVi: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  titleSub: { fontSize: 8, fontStyle: 'italic', color: '#475569', marginTop: 2 },
  titleKm: { fontFamily: 'Battambang', fontSize: 9, color: '#475569', marginTop: 1 },
  currencyRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 },
  currencyLabel: { fontSize: 7, color: '#475569' },
  currencyVal: { fontSize: 8, fontWeight: 'bold', marginLeft: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: B },
  cell: { padding: 4, borderRightWidth: 0.5, borderRightColor: B, justifyContent: 'center' },
  cellLast: { padding: 4, justifyContent: 'center' },
  labelVi: { fontSize: 8, fontWeight: 'bold', color: '#1e293b' },
  labelSub: { fontSize: 6, color: '#64748b', fontStyle: 'italic' },
  labelKm: { fontFamily: 'Battambang', fontSize: 7, color: '#64748b' },
  valText: { fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  valDeduction: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#be123c' },
  sectionHeader: { padding: 4, fontStyle: 'italic', fontSize: 8, fontWeight: 'bold', color: '#047857' },
  sectionHeaderDed: { padding: 4, fontStyle: 'italic', fontSize: 8, fontWeight: 'bold', color: '#be123c' },
  greenBg: { backgroundColor: '#a3d29c' },
  yellowBg: { backgroundColor: '#fee197' },
  disclaimer: { marginTop: 8, padding: 6, backgroundColor: '#fffbeb', borderWidth: 0.5, borderColor: '#fde68a', borderRadius: 2, fontSize: 6, color: '#92400e' },
  footer: { position: 'absolute', bottom: 16, left: 30, right: 30, fontSize: 6, color: '#94a3b8', textAlign: 'center' },
});

/* KHR → Khmer sub-label, USD → English sub-label */
function SubLabel({ vi, isKHR }: { vi: string; isKHR: boolean }) {
  if (isKHR) {
    const km = LABEL_KM[vi];
    return km ? <Text style={s.labelKm}>{km}</Text> : null;
  }
  const en = LABEL_EN[vi];
  return en ? <Text style={s.labelSub}>{en}</Text> : null;
}

function RowLabel({ vi, isKHR }: { vi: string; isKHR: boolean }) {
  return (
    <View>
      <Text style={s.labelVi}>{vi}</Text>
      <SubLabel vi={vi} isKHR={isKHR} />
    </View>
  );
}

const logoPath = path.join(process.cwd(), 'public', 'LOGO-THACO-AGRI-02-Copy-e1688459733402.png');

export function SalarySlipPdfDocument({ data }: { data: SalarySlipViewProps }) {
  const maxRows = Math.max(data.incomeRows.length, data.deductionRows.length);
  const month = data.slipTitle.match(/\d+/)?.[0] || '';
  const isKHR = data.currency?.trim().toUpperCase() === 'KHR';
  const kmFont = isKHR ? 'Battambang' : 'NotoSans';

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.headerRow}>
          <View style={s.logoArea}>
            <Image src={logoPath} style={s.logo} />
            <Text style={s.companyName}>{data.companyName}</Text>
          </View>
          <View>
            <Text style={s.dateLabel}>{data.slipDateLabel}</Text>
          </View>
        </View>

        {/* ── Title ── */}
        <View style={s.titleBlock}>
          <Text style={s.titleVi}>{data.slipTitle}</Text>
          {isKHR ? (
            <Text style={s.titleKm}>
              {data.period === 1 ? `ប័ណ្ណបើកប្រាក់បៀវត្សរ៍បណ្ដោះអាសន្នខែ ${month}` : `ប័ណ្ណបើកប្រាក់បៀវត្សរ៍ប្រចាំខែ ${month}`}
            </Text>
          ) : (
            <Text style={s.titleSub}>
              {data.period === 1 ? `ADVANCE SALARY SLIP FOR MONTH ${month}` : `SALARY SLIP FOR MONTH ${month}`}
            </Text>
          )}
        </View>

        {/* ── Currency ── */}
        <View style={s.currencyRow}>
          <Text style={s.currencyLabel}>{isKHR ? 'ឯកតារង្វាស់:' : 'Đơn vị tính:'}</Text>
          <Text style={s.currencyVal}>{data.currency}</Text>
        </View>

        {/* ── Employee Info ── */}
        <View style={{ borderWidth: 0.5, borderColor: BH, marginBottom: 6 }}>
          <View style={[s.tableRow, { backgroundColor: '#eff6ff' }]}>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Mã Nhân viên</Text>
              {isKHR ? <Text style={s.labelKm}>លេខសម្គាល់បុគ្គលិក</Text> : <Text style={s.labelSub}>Emp ID</Text>}
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={[s.valText, { fontSize: 10 }]}>{data.employeeCode}</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Chức vụ</Text>
              {isKHR ? <Text style={s.labelKm}>មុខតំណែង</Text> : <Text style={s.labelSub}>Position / Job Title</Text>}
            </View>
            <View style={[s.cellLast, { width: '25%' }]}>
              <Text style={[s.valText, { fontFamily: kmFont, fontStyle: 'italic' }]}>{data.position}</Text>
            </View>
          </View>
          <View style={s.tableRow}>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Tên Nhân viên</Text>
              {isKHR ? <Text style={s.labelKm}>ឈ្មោះពេញ</Text> : <Text style={s.labelSub}>Full Name</Text>}
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={[s.valText, { fontFamily: kmFont, fontSize: 9, textTransform: 'uppercase' }]}>{data.employeeName}</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Phòng ban</Text>
              {isKHR ? <Text style={s.labelKm}>នាយកដ្ឋាន</Text> : <Text style={s.labelSub}>Department</Text>}
            </View>
            <View style={[s.cellLast, { width: '25%' }]}>
              <Text style={[s.valText, { fontFamily: kmFont, fontStyle: 'italic' }]}>{data.department}</Text>
            </View>
          </View>
          {data.email && data.email !== '-' && (
          <View style={[s.tableRow, { backgroundColor: '#eff6ff' }]}>
            <View style={[s.cell, { width: '50%' }]}>
              <Text style={s.labelVi}>Địa chỉ mail / Email</Text>
            </View>
            <View style={[s.cellLast, { width: '50%' }]}>
              <Text style={[s.valText, { color: '#2563eb' }]}>{data.email}</Text>
            </View>
          </View>
          )}
        </View>

        {/* ── Salary Detail Table ── */}
        <View style={{ borderWidth: 0.5, borderColor: BH }}>

          {/* Gross + Base */}
          {(data.grossIncome || data.baseInsurance) && (
          <View style={[s.tableRow, s.greenBg, { borderBottomWidth: 1.5, borderBottomColor: '#fff' }]}>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Lương thu nhập</Text>
              {isKHR ? <Text style={s.labelKm}>ប្រាក់ខែសរុប</Text> : <Text style={s.labelSub}>Gross Salary</Text>}
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={[s.valText, { fontSize: 11 }]}>{data.grossIncome || ''}</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Lương Cơ bản (Đóng BHXH)</Text>
              {isKHR ? <Text style={s.labelKm}>ប្រាក់ខែមូលដ្ឋាន</Text> : <Text style={s.labelSub}>Base Salary (Social Ins.)</Text>}
            </View>
            <View style={[s.cellLast, { width: '25%' }]}>
              <Text style={[s.valText, { fontSize: 11 }]}>{data.baseInsurance || ''}</Text>
            </View>
          </View>
          )}

          {/* Section headers */}
          {(data.incomeRows.length > 0 || data.deductionRows.length > 0) && (
          <View style={s.tableRow}>
            <View style={[s.cell, { width: '50%' }]}>
              <Text style={s.sectionHeader}>❖ Các khoản thu nhập:</Text>
              {isKHR
                ? <Text style={[s.labelKm, { paddingLeft: 4 }]}>❖ ប្រាក់ចំណូល:</Text>
                : <Text style={[s.labelSub, { paddingLeft: 4 }]}>❖ Incomes:</Text>}
            </View>
            <View style={[s.cellLast, { width: '50%' }]}>
              {data.deductionRows.length > 0 ? (
                <>
                  <Text style={s.sectionHeaderDed}>❖ Các khoản khấu trừ:</Text>
                  {isKHR
                    ? <Text style={[s.labelKm, { paddingLeft: 4 }]}>❖ ការកាត់កង:</Text>
                    : <Text style={[s.labelSub, { paddingLeft: 4 }]}>❖ Deductions:</Text>}
                </>
              ) : null}
            </View>
          </View>
          )}

          {/* Income + Deduction rows */}
          {Array.from({ length: maxRows }).map((_, i) => {
            const inc = data.incomeRows[i];
            const ded = data.deductionRows[i];
            return (
              <View key={i} style={s.tableRow} wrap={false}>
                {inc ? (
                  <>
                    <View style={[s.cell, { width: '25%' }]}><RowLabel vi={inc.label} isKHR={isKHR} /></View>
                    <View style={[s.cell, { width: '25%' }]}><Text style={s.valText}>{inc.value}</Text></View>
                  </>
                ) : (
                  <>
                    <View style={[s.cell, { width: '25%', backgroundColor: '#f8fafc' }]} />
                    <View style={[s.cell, { width: '25%', backgroundColor: '#f8fafc' }]} />
                  </>
                )}
                {ded ? (
                  <>
                    <View style={[s.cell, { width: '25%' }]}><RowLabel vi={ded.label} isKHR={isKHR} /></View>
                    <View style={[s.cellLast, { width: '25%' }]}><Text style={s.valDeduction}>{ded.value}</Text></View>
                  </>
                ) : (
                  <>
                    <View style={[s.cell, { width: '25%', backgroundColor: '#f8fafc' }]} />
                    <View style={[s.cellLast, { width: '25%', backgroundColor: '#f8fafc' }]} />
                  </>
                )}
              </View>
            );
          })}

          {/* Totals */}
          {(data.totalIncome || data.totalDeduction) && (
          <View style={[s.tableRow, s.greenBg]}>
            <View style={[s.cell, { width: '25%', padding: 6 }]}>
              <Text style={s.labelVi}>Tổng lương thu nhập (1)</Text>
              {isKHR ? <Text style={s.labelKm}>ប្រាក់ចំណូលសរុប (1)</Text> : <Text style={s.labelSub}>Total Income (1)</Text>}
            </View>
            <View style={[s.cell, { width: '25%', padding: 6 }]}>
              <Text style={[s.valText, { fontSize: 10 }]}>{data.totalIncome || ''}</Text>
            </View>
            <View style={[s.cell, { width: '25%', padding: 6 }]}>
              <Text style={s.labelVi}>Tổng giảm trừ (2)</Text>
              {isKHR ? <Text style={s.labelKm}>ការកាត់កងសរុប (2)</Text> : <Text style={s.labelSub}>Total Deduction (2)</Text>}
            </View>
            <View style={[s.cellLast, { width: '25%', padding: 6 }]}>
              <Text style={[s.valDeduction, { fontSize: 10 }]}>{data.totalDeduction || ''}</Text>
            </View>
          </View>
          )}

          {/* Net Pay */}
          <View style={[s.tableRow, s.yellowBg, { borderBottomWidth: 0 }]}>
            <View style={[s.cell, { width: '50%', padding: 10 }]}>
              <Text style={[s.labelVi, { fontSize: 10, textAlign: 'center', textTransform: 'uppercase' }]}>Lương Thực Nhận (1) - (2)</Text>
              {isKHR
                ? <Text style={[s.labelKm, { textAlign: 'center', fontSize: 8 }]}>ប្រាក់កម្រៃសុទ្ធ</Text>
                : <Text style={[s.labelSub, { textAlign: 'center', fontSize: 7 }]}>NET SALARY</Text>}
            </View>
            <View style={[s.cellLast, { width: '50%', padding: 10 }]}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#be123c' }}>{data.netPay}</Text>
            </View>
          </View>
        </View>

        {/* ── Disclaimer ── */}
        <View style={s.disclaimer}>
          <Text>Lương là bảo mật, mọi hành vi tìm hiểu lương người khác sẽ bị xử phạt theo quy chế của Công ty.</Text>
          {isKHR
            ? <Text style={[s.labelKm, { marginTop: 2, fontSize: 6 }]}>ប្រាក់ខែគឺជាការសម្ងាត់ រាល់សកម្មភាពស្វែងរកប្រាក់ខែអ្នកដទៃនឹងត្រូវពិន័យតាមបទប្បញ្ញត្តិក្រុមហ៊ុន។</Text>
            : <Text style={{ fontStyle: 'italic', marginTop: 2, fontSize: 6, color: '#92400e' }}>Salary is confidential. Any attempt to access others' salary will be disciplined per company policy.</Text>}
        </View>

        <Text style={s.footer} fixed>
          Phiếu lương điện tử — in/ngày {new Date().toLocaleDateString('vi-VN')}
        </Text>
      </Page>
    </Document>
  );
}
