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
  src: path.join(fontsDir, 'NotoSans-Regular.ttf'),
});
Font.register({
  family: 'NotoSansKhmer',
  src: path.join(fontsDir, 'NotoSansKhmer-Regular.ttf'),
});

const LABEL_MAP: Record<string, { en: string; km: string }> = {
  'Ngày công chuẩn/tháng': { en: 'Standard Working Days/Mo', km: 'ថ្ងៃធ្វើការស្តង់ដារ' },
  'Ngày công làm việc thực tế': { en: 'Actual Working Days', km: 'ថ្ងៃធ្វើការជាក់ស្តែង' },
  'Lương ngày công làm việc thực tế': { en: 'Actual Working Days Salary', km: 'ប្រាក់ខែថ្ងៃធ្វើការជាក់ស្តែង' },
  'Lương nghỉ nhật': { en: 'Sunday Rest Salary', km: 'ប្រាក់ខែថ្ងៃអាទិត្យ' },
  'Ngày công nghỉ nhật': { en: 'Sunday Rest Days', km: 'ថ្ងៃឈប់សម្រាកអាទិត្យ' },
  'Lương ngày nghỉ phép': { en: 'Annual Leave Salary', km: 'ប្រាក់ខែឈប់សម្រាកប្រចាំឆ្នាំ' },
  'Ngày công nghỉ phép': { en: 'Annual Leave Days', km: 'ថ្ងៃឈប់សម្រាកប្រចាំឆ្នាំ' },
  'Lương ngày nghỉ Thứ 7': { en: 'Saturday Salary', km: 'ប្រាក់ខែថ្ងៃសៅរ៍' },
  'Ngày công nghỉ Thứ 7': { en: 'Saturday Days', km: 'ថ្ងៃសៅរ៍' },
  'Lương làm việc ngày Lễ/Tết': { en: 'Holiday Salary', km: 'ប្រាក់ខែថ្ងៃឈប់សម្រាក' },
  'Ngày công làm việc ngày Lễ/Tết': { en: 'Holiday Working Days', km: 'ថ្ងៃធ្វើការថ្ងៃឈប់សម្រាក' },
  'Lương ngày nghỉ Lễ/Tết/Nghỉ bù': { en: 'Paid Leave Salary', km: 'ប្រាក់បៀវត្សរ៍សម្រាក' },
  'Ngày công nghỉ Lễ/Tết/NB': { en: 'Paid Leave Days', km: 'ថ្ងៃឈប់សម្រាក' },
  'Lương ngày LVTN/Nghỉ bù': { en: 'Comp Leave Salary', km: 'ប្រាក់ខែឈប់សម្រាកជំនួស' },
  'Ngày công LVTN/NB': { en: 'Comp Leave Days', km: 'ថ្ងៃឈប់សម្រាកជំនួស' },
  'Lương ngày nghỉ Chế độ': { en: 'Welfare Leave Salary', km: 'ប្រាក់ខែសម្រាកសុខុមាលភាព' },
  'Ngày công nghỉ Chế độ': { en: 'Welfare Leave Days', km: 'ថ្ងៃឈប់សម្រាកសុខុមាលភាព' },
  'Giờ tăng ca': { en: 'Overtime Hours', km: 'ម៉ោងថែមម៉ោង' },
  'Lương tăng ca': { en: 'Overtime Salary', km: 'ប្រាក់បៀវត្សរ៍ថែមម៉ោង' },
  'Giờ bổ tăng ca': { en: 'Additional OT Hours', km: 'ម៉ោងថែមម៉ោងបន្ថែម' },
  'Lương bổ tăng ca': { en: 'Additional OT Salary', km: 'ប្រាក់បៀវត្សរ៍ថែមម៉ោងបន្ថែម' },
  'Truy lĩnh': { en: 'Arrears', km: 'ប្រាក់ជំពាក់' },
  'Diễn giải truy lĩnh': { en: 'Arrears Note', km: 'កំណត់ចំណាំប្រាក់ជំពាក់' },
  'Phụ cấp Chức danh': { en: 'Position Allowance', km: 'ប្រាក់ឧបត្ថម្ភមុខតំណែង' },
  'Phụ cấp xăng xe': { en: 'Gas Allowance', km: 'ប្រាក់ឧបត្ថម្ភសាំង' },
  'Phụ cấp ăn ca': { en: 'Meal Allowance', km: 'ប្រាក់ឧបត្ថម្ភអាហារ' },
  'Phụ cấp điện thoại': { en: 'Phone Allowance', km: 'ប្រាក់ឧបត្ថម្ភទូរស័ព្ទ' },
  'Phụ cấp Kiêm nhiệm': { en: 'Concurrent Duty Allowance', km: 'ប្រាក់ឧបត្ថម្ភការងារស្របពេល' },
  'Thưởng chuyên cần': { en: 'Attendance Bonus', km: 'ប្រាក់រង្វាន់វត្តមាន' },
  'Quà 8/3': { en: 'Holiday Gift', km: 'អំណោយថ្ងៃឈប់សម្រាក' },
  'Quà sinh nhật/thuật lễ': { en: 'Birthday/Ceremony Gift', km: 'អំណោយខួបកំណើត/ពិធី' },
  'Chi phí về phép/ vé máy bay': { en: 'Flight Ticket / Vacation', km: 'សំបុត្រយន្តហោះ/វិស្សមកាល' },
  'Bảo hiểm xã hội CCPC': { en: 'Social Insurance', km: 'ធានារ៉ាប់រងសង្គម' },
  'Thuế thu nhập': { en: 'Income Tax', km: 'ពន្ធលើប្រាក់ចំណូល' },
  'Tiền ăn': { en: 'Meal Deduction', km: 'ការកាត់ប្រាក់អាហារ' },
  'Tiền điện nước': { en: 'Utilities', km: 'ទឹកភ្លើង' },
  'Số tiền đã ứng': { en: 'Advanced Payment', km: 'ប្រាក់កក់ដែលបានបង់' },
  'Tạm ứng lương Kỳ 1': { en: 'Phase 1 Advance', km: 'ប្រាក់កក់វគ្គ១' },
  'Truy thu': { en: 'Deduction', km: 'ការកាត់ប្រាក់' },
  'Diễn giải truy thu': { en: 'Deduction Note', km: 'កំណត់ចំណាំការកាត់' },
  'Tang chế': { en: 'Funeral Allowance', km: 'ប្រាក់ឧបត្ថម្ភបុណ្យសព' },
  'Quỹ sinh nhật': { en: 'Birthday Fund', km: 'មូលនិធិខួបកំណើត' },
  'Phụ cấp ĐDCĐ': { en: 'Union Allowance', km: 'ប្រាក់ឧបត្ថម្ភសហជីព' },
};

const B = '#c5d3e8'; // border color (blue-200)
const BH = '#9fb8da'; // border header (blue-300)

const s = StyleSheet.create({
  page: { fontFamily: 'NotoSans', fontSize: 8, padding: 30, color: '#1e293b' },
  // Header
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  logoArea: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logo: { width: 36, height: 36 },
  companyName: { fontSize: 11, fontWeight: 'bold' },
  dateLabel: { fontSize: 8, textAlign: 'right', color: '#475569', fontStyle: 'italic' },
  // Title
  titleBlock: { textAlign: 'center', marginBottom: 10, marginTop: 4 },
  titleVi: { fontSize: 13, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  titleEn: { fontSize: 8, fontStyle: 'italic', color: '#475569', marginTop: 2 },
  titleKm: { fontFamily: 'NotoSansKhmer', fontSize: 9, color: '#475569', marginTop: 1 },
  // Currency
  currencyRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 },
  currencyLabel: { fontSize: 7, color: '#475569' },
  currencyVal: { fontSize: 8, fontWeight: 'bold', marginLeft: 4 },
  // Table
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: B },
  cell: { padding: 4, borderRightWidth: 0.5, borderRightColor: B, justifyContent: 'center' },
  cellLast: { padding: 4, justifyContent: 'center' },
  labelVi: { fontSize: 8, fontWeight: 'bold', color: '#1e293b' },
  labelEn: { fontSize: 6, color: '#64748b', fontStyle: 'italic' },
  labelKm: { fontFamily: 'NotoSansKhmer', fontSize: 7, color: '#64748b' },
  valText: { fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  valDeduction: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#be123c' },
  // Section headers
  sectionHeader: { backgroundColor: '#f0fdf4', padding: 4, fontStyle: 'italic', fontSize: 8, fontWeight: 'bold', color: '#047857' },
  sectionHeaderDed: { backgroundColor: '#fff1f2', padding: 4, fontStyle: 'italic', fontSize: 8, fontWeight: 'bold', color: '#be123c' },
  // Gross/Base row
  greenBg: { backgroundColor: '#a3d29c' },
  // Total row
  yellowBg: { backgroundColor: '#fee197' },
  // Disclaimer
  disclaimer: { marginTop: 8, padding: 6, backgroundColor: '#fffbeb', borderWidth: 0.5, borderColor: '#fde68a', borderRadius: 2, fontSize: 6, color: '#92400e' },
  footer: { position: 'absolute', bottom: 16, left: 30, right: 30, fontSize: 6, color: '#94a3b8', textAlign: 'center' },
});

function TriLabel({ vi }: { vi: string }) {
  const mapped = LABEL_MAP[vi];
  return (
    <View>
      <Text style={s.labelVi}>{vi}</Text>
      {mapped?.en ? <Text style={s.labelEn}>{mapped.en}</Text> : null}
      {mapped?.km ? <Text style={s.labelKm}>{mapped.km}</Text> : null}
    </View>
  );
}

const logoPath = path.join(process.cwd(), 'public', 'LOGO-THACO-AGRI-02-Copy-e1688459733402.png');

export function SalarySlipPdfDocument({ data }: { data: SalarySlipViewProps }) {
  const maxRows = Math.max(data.incomeRows.length, data.deductionRows.length);
  const month = data.slipTitle.match(/\d+/)?.[0] || '';

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header: Logo + Company | Date ── */}
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
          <Text style={s.titleEn}>
            {data.period === 1 ? `ADVANCE SALARY SLIP FOR MONTH ${month}` : `SALARY SLIP FOR MONTH ${month}`}
          </Text>
          <Text style={s.titleKm}>
            {data.period === 1 ? `ប័ណ្ណបើកប្រាក់បៀវត្សរ៍បណ្ដោះអាសន្នខែ ${month}` : `ប័ណ្ណបើកប្រាក់បៀវត្សរ៍ប្រចាំខែ ${month}`}
          </Text>
        </View>

        {/* ── Currency ── */}
        <View style={s.currencyRow}>
          <Text style={s.currencyLabel}>Đơn vị tính:</Text>
          <Text style={s.currencyVal}>{data.currency}</Text>
        </View>

        {/* ── Employee Info Table ── */}
        <View style={{ borderWidth: 0.5, borderColor: BH, marginBottom: 6 }}>
          {/* Row 1: Mã NV + Chức vụ */}
          <View style={[s.tableRow, { backgroundColor: '#eff6ff' }]}>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Mã Nhân viên</Text>
              <Text style={s.labelEn}>Emp ID</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={[s.valText, { fontSize: 10 }]}>{data.employeeCode}</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Chức vụ</Text>
              <Text style={s.labelEn}>Position / Job Title</Text>
            </View>
            <View style={[s.cellLast, { width: '25%' }]}>
              <Text style={[s.valText, { fontStyle: 'italic' }]}>{data.position}</Text>
            </View>
          </View>
          {/* Row 2: Tên NV + Phòng ban */}
          <View style={s.tableRow}>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Tên Nhân viên</Text>
              <Text style={s.labelEn}>Full Name</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={[s.valText, { fontSize: 9, textTransform: 'uppercase' }]}>{data.employeeName}</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Phòng ban</Text>
              <Text style={s.labelEn}>Department</Text>
            </View>
            <View style={[s.cellLast, { width: '25%' }]}>
              <Text style={[s.valText, { fontStyle: 'italic' }]}>{data.department}</Text>
            </View>
          </View>
          {/* Row 3: Email */}
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
              <Text style={s.labelEn}>Gross Salary</Text>
              <Text style={s.labelKm}>ប្រាក់ខែសរុប</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={[s.valText, { fontSize: 11 }]}>{data.grossIncome || ''}</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Lương Cơ bản (Đóng BHXH)</Text>
              <Text style={s.labelEn}>Base Salary (Social Ins.)</Text>
              <Text style={s.labelKm}>ប្រាក់ខែមូលដ្ឋាន</Text>
            </View>
            <View style={[s.cellLast, { width: '25%' }]}>
              <Text style={[s.valText, { fontSize: 11 }]}>{data.baseInsurance || ''}</Text>
            </View>
          </View>
          )}

          {/* Section headers: Income | Deductions */}
          {(data.incomeRows.length > 0 || data.deductionRows.length > 0) && (
          <View style={s.tableRow}>
            <View style={[s.cell, { width: '50%' }]}>
              <Text style={s.sectionHeader}>❖ Các khoản thu nhập:</Text>
              <Text style={[s.labelEn, { paddingLeft: 4 }]}>❖ Incomes:</Text>
            </View>
            <View style={[s.cellLast, { width: '50%' }]}>
              {data.deductionRows.length > 0 ? (
                <>
                  <Text style={s.sectionHeaderDed}>❖ Các khoản khấu trừ:</Text>
                  <Text style={[s.labelEn, { paddingLeft: 4 }]}>❖ Deductions:</Text>
                </>
              ) : null}
            </View>
          </View>
          )}

          {/* Income + Deduction rows side by side */}
          {Array.from({ length: maxRows }).map((_, i) => {
            const inc = data.incomeRows[i];
            const ded = data.deductionRows[i];
            return (
              <View key={i} style={s.tableRow} wrap={false}>
                {inc ? (
                  <>
                    <View style={[s.cell, { width: '25%' }]}>
                      <TriLabel vi={inc.label} />
                    </View>
                    <View style={[s.cell, { width: '25%' }]}>
                      <Text style={s.valText}>{inc.value}</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={[s.cell, { width: '25%', backgroundColor: '#f8fafc' }]} />
                    <View style={[s.cell, { width: '25%', backgroundColor: '#f8fafc' }]} />
                  </>
                )}
                {ded ? (
                  <>
                    <View style={[s.cell, { width: '25%' }]}>
                      <TriLabel vi={ded.label} />
                    </View>
                    <View style={[s.cellLast, { width: '25%' }]}>
                      <Text style={s.valDeduction}>{ded.value}</Text>
                    </View>
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
              <Text style={s.labelEn}>Total Income (1)</Text>
            </View>
            <View style={[s.cell, { width: '25%', padding: 6 }]}>
              <Text style={[s.valText, { fontSize: 10 }]}>{data.totalIncome || ''}</Text>
            </View>
            <View style={[s.cell, { width: '25%', padding: 6 }]}>
              <Text style={s.labelVi}>Tổng giảm trừ (2)</Text>
              <Text style={s.labelEn}>Total Deduction (2)</Text>
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
              <Text style={[s.labelEn, { textAlign: 'center', fontSize: 7 }]}>NET SALARY / ប្រាក់កម្រៃសុទ្ធ</Text>
            </View>
            <View style={[s.cellLast, { width: '50%', padding: 10 }]}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#be123c' }}>{data.netPay}</Text>
            </View>
          </View>
        </View>

        {/* ── Disclaimer ── */}
        <View style={s.disclaimer}>
          <Text>Lương là bảo mật, mọi hành vi tìm hiểu lương người khác sẽ bị xử phạt theo quy chế của Công ty.</Text>
          <Text style={{ fontStyle: 'italic', marginTop: 2 }}>Salary is confidential. Any attempt to access others&apos; salary will be disciplined per company policy.</Text>
        </View>

        {/* ── Footer ── */}
        <Text style={s.footer} fixed>
          Phiếu lương điện tử — in/ngày {new Date().toLocaleDateString('vi-VN')}
        </Text>
      </Page>
    </Document>
  );
}
