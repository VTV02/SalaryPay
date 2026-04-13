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
  titleEn: { fontSize: 8, fontStyle: 'italic', color: '#475569', marginTop: 2 },
  currencyRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 6 },
  currencyLabel: { fontSize: 7, color: '#475569' },
  currencyVal: { fontSize: 8, fontWeight: 'bold', marginLeft: 4 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: B },
  cell: { padding: 4, borderRightWidth: 0.5, borderRightColor: B, justifyContent: 'center' },
  cellLast: { padding: 4, justifyContent: 'center' },
  labelVi: { fontSize: 8, fontWeight: 'bold', color: '#1e293b' },
  labelEn: { fontSize: 6, color: '#64748b', fontStyle: 'italic' },
  valText: { fontSize: 8, fontWeight: 'bold', textAlign: 'center' },
  valDeduction: { fontSize: 8, fontWeight: 'bold', textAlign: 'center', color: '#be123c' },
  sectionHeader: { padding: 4, fontStyle: 'italic', fontSize: 8, fontWeight: 'bold', color: '#047857' },
  sectionHeaderDed: { padding: 4, fontStyle: 'italic', fontSize: 8, fontWeight: 'bold', color: '#be123c' },
  greenBg: { backgroundColor: '#a3d29c' },
  yellowBg: { backgroundColor: '#fee197' },
  disclaimer: { marginTop: 8, padding: 6, backgroundColor: '#fffbeb', borderWidth: 0.5, borderColor: '#fde68a', borderRadius: 2, fontSize: 6, color: '#92400e' },
  footer: { position: 'absolute', bottom: 16, left: 30, right: 30, fontSize: 6, color: '#94a3b8', textAlign: 'center' },
});

function TriLabel({ vi }: { vi: string }) {
  const en = LABEL_EN[vi] || '';
  return (
    <View>
      <Text style={s.labelVi}>{vi}</Text>
      {en ? <Text style={s.labelEn}>{en}</Text> : null}
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
        </View>

        {/* ── Currency ── */}
        <View style={s.currencyRow}>
          <Text style={s.currencyLabel}>Đơn vị tính:</Text>
          <Text style={s.currencyVal}>{data.currency}</Text>
        </View>

        {/* ── Employee Info Table ── */}
        <View style={{ borderWidth: 0.5, borderColor: BH, marginBottom: 6 }}>
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
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={[s.valText, { fontSize: 11 }]}>{data.grossIncome || ''}</Text>
            </View>
            <View style={[s.cell, { width: '25%' }]}>
              <Text style={s.labelVi}>Lương Cơ bản (Đóng BHXH)</Text>
              <Text style={s.labelEn}>Base Salary (Social Ins.)</Text>
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
              <Text style={[s.labelEn, { textAlign: 'center', fontSize: 7 }]}>NET SALARY</Text>
            </View>
            <View style={[s.cellLast, { width: '50%', padding: 10 }]}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#be123c' }}>{data.netPay}</Text>
            </View>
          </View>
        </View>

        {/* ── Disclaimer ── */}
        <View style={s.disclaimer}>
          <Text>Lương là bảo mật, mọi hành vi tìm hiểu lương người khác sẽ bị xử phạt theo quy chế của Công ty.</Text>
          <Text style={{ fontStyle: 'italic', marginTop: 2 }}>Salary is confidential. Any attempt to access others' salary will be disciplined per company policy.</Text>
        </View>

        {/* ── Footer ── */}
        <Text style={s.footer} fixed>
          Phiếu lương điện tử — in/ngày {new Date().toLocaleDateString('vi-VN')}
        </Text>
      </Page>
    </Document>
  );
}
