import React from 'react';
import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { buildSlipProps } from '@/lib/map-salary-slip';
import { SalarySlipPdfDocument } from '@/components/SalarySlipPdfDocument';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 });
  }

  const month = req.nextUrl.searchParams.get('month')?.trim() || undefined;
  const periodParam = req.nextUrl.searchParams.get('period')?.trim();
  const period = periodParam ? parseInt(periodParam, 10) : undefined;

  const worker = await prisma.worker.findUnique({
    where: { id: session.workerId },
  });

  if (!worker) {
    return NextResponse.json({ error: 'Không tìm thấy nhân viên.' }, { status: 404 });
  }

  const salary = month && period
    ? await prisma.salary.findUnique({
        where: {
          workerId_monthYear_period: { workerId: worker.id, monthYear: month, period },
        },
      })
    : await prisma.salary.findFirst({
        where: { workerId: worker.id },
        orderBy: [{ monthYear: 'desc' }, { period: 'desc' }],
      });

  if (!salary) {
    return NextResponse.json({ error: 'Chưa có dữ liệu lương cho kỳ này.' }, { status: 404 });
  }

  try {
    const props = buildSlipProps(worker, salary);
    const buffer = await renderToBuffer(
      // @react-pdf/renderer expects a <Document> tree; root component still renders <Document>.
      React.createElement(SalarySlipPdfDocument, { data: props }) as Parameters<
        typeof renderToBuffer
      >[0]
    );
    const filename = `phieu-luong-${salary.monthYear}-dot${salary.period}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (e) {
    console.error('PDF render:', e);
    return NextResponse.json({ error: 'Không tạo được file PDF.' }, { status: 500 });
  }
}
