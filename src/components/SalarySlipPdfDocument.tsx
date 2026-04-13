import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import type { SalarySlipViewProps } from '@/components/SalarySlipView';

Font.register({
  family: 'Roboto',
  src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxK.ttf',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 9,
    padding: 36,
    color: '#1e293b',
  },
  header: {
    backgroundColor: '#065f46',
    color: '#ecfdf5',
    padding: 20,
    marginBottom: 16,
    borderRadius: 4,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
  },
  headerSub: {
    fontSize: 9,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 10,
  },
  badge: {
    alignSelf: 'center',
    backgroundColor: '#047857',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 9,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#047857',
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  labelMuted: { fontSize: 8, color: '#64748b' },
  valueBold: { fontSize: 9, fontWeight: 'bold' },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  cell: {
    width: '50%',
    paddingVertical: 4,
    paddingRight: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  kvLabel: { flex: 1, color: '#475569', fontSize: 8 },
  kvVal: { fontSize: 8, fontWeight: 'bold', color: '#0f172a' },
  totals: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: 16,
    borderRadius: 6,
    marginTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  net: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 4,
  },
  netLabel: { fontSize: 9, color: '#cbd5e1' },
  netVal: { fontSize: 18, fontWeight: 'bold', color: '#34d399' },
  disclaimer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 4,
    fontSize: 7,
    color: '#92400e',
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

const MAX_ROWS = 35;

function RowList({
  title,
  rows,
  accent,
}: {
  title: string;
  rows: SalarySlipViewProps['incomeRows'];
  accent: 'emerald' | 'rose';
}) {
  const color = accent === 'emerald' ? '#047857' : '#e11d48';
  const slice = rows.slice(0, MAX_ROWS);
  return (
    <View>
      <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
      {slice.map((row, i) => (
        <View key={i} style={styles.kvRow} wrap={false}>
          <View style={{ flex: 1 }}>
            <Text style={styles.kvLabel}>{row.label}</Text>
            {row.sub ? <Text style={{ fontSize: 7, color: '#64748b' }}>{row.sub}</Text> : null}
          </View>
          <Text style={styles.kvVal}>{row.value}</Text>
        </View>
      ))}
      {rows.length > MAX_ROWS ? (
        <Text style={{ fontSize: 7, color: '#64748b', marginTop: 4 }}>
          … và {rows.length - MAX_ROWS} dòng khác (xem đầy đủ trên web).
        </Text>
      ) : null}
    </View>
  );
}

export function SalarySlipPdfDocument({ data }: { data: SalarySlipViewProps }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{data.companyName}</Text>
          <Text style={styles.headerSub}>{data.slipDateLabel}</Text>
          <Text style={styles.badge}>{data.slipTitle}</Text>
        </View>

        <View style={styles.row2}>
          <View>
            <Text style={styles.labelMuted}>Đơn vị tính</Text>
            <Text style={styles.valueBold}>{data.currency}</Text>
          </View>
          {data.currency === 'USD' && data.exchangeRate !== '-' && (
          <View>
            <Text style={styles.labelMuted}>Tỷ giá USD/VNĐ</Text>
            <Text style={styles.valueBold}>{data.exchangeRate}</Text>
          </View>
          )}
        </View>

        <Text style={[styles.sectionTitle, { color: '#047857' }]}>Thông tin nhân viên</Text>
        <View style={styles.grid2}>
          <View style={styles.cell}>
            <Text style={styles.labelMuted}>Tên nhân viên</Text>
            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{data.employeeName}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.labelMuted}>Mã nhân viên</Text>
            <Text style={styles.valueBold}>{data.employeeCode}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.labelMuted}>Chức vụ</Text>
            <Text style={styles.valueBold}>{data.position}</Text>
          </View>
          <View style={styles.cell}>
            <Text style={styles.labelMuted}>Phòng ban</Text>
            <Text style={styles.valueBold}>{data.department}</Text>
          </View>
          <View style={[styles.cell, { width: '100%' }]}>
            <Text style={styles.labelMuted}>Địa chỉ mail</Text>
            <Text style={styles.valueBold}>{data.email}</Text>
          </View>
        </View>

        <View style={styles.row2}>
          <View style={{ flex: 1 }}>
            <Text style={styles.labelMuted}>Lương thu nhập</Text>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#047857' }}>{data.grossIncome}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.labelMuted}>Lương cơ bản (BHXH)</Text>
            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{data.baseInsurance}</Text>
          </View>
        </View>

        <RowList title="Các khoản thu nhập" rows={data.incomeRows} accent="emerald" />
        <RowList title="Các khoản khấu trừ" rows={data.deductionRows} accent="rose" />

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={{ color: '#cbd5e1', fontSize: 9 }}>Tổng lương thu nhập (1)</Text>
            <Text style={{ color: '#fff', fontSize: 10 }}>{data.totalIncome}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={{ color: '#cbd5e1', fontSize: 9 }}>Tổng giảm trừ (2)</Text>
            <Text style={{ color: '#fff', fontSize: 10 }}>{data.totalDeduction}</Text>
          </View>
          <View style={styles.net}>
            <Text style={styles.netLabel}>LƯƠNG THỰC NHẬN (1) − (2)</Text>
            <Text style={styles.netVal}>{data.netPay}</Text>
          </View>
        </View>

        <Text style={styles.disclaimer}>
          Lương là bảo mật, mọi hành vi tìm hiểu lương người khác sẽ bị xử phạt theo quy chế của Công ty.
        </Text>

        <Text style={styles.footer} fixed>
          Phiếu lương điện tử — in/ngày {new Date().toLocaleDateString('vi-VN')}
        </Text>
      </Page>
    </Document>
  );
}
