import prisma from './src/lib/prisma';
import crypto from 'crypto';

async function main() {
  const employeeCode = 'NV001';
  const cccd = '123456';
  const cccdHash = crypto.createHash('sha256').update(cccd).digest('hex');

  await prisma.worker.upsert({
    where: { employeeCode },
    update: { cccdHash, fullName: 'Người Dùng Test' },
    create: { employeeCode, fullName: 'Người Dùng Test', cccdHash }
  });

  await prisma.salary.upsert({
    where: { workerId_monthYear: { workerId: (await prisma.worker.findUnique({where: {employeeCode}}))!.id, monthYear: '2023-10' } },
    update: {},
    create: {
      workerId: (await prisma.worker.findUnique({where: {employeeCode}}))!.id,
      monthYear: '2023-10',
      baseSalary: 10000000,
      netSalary: 9500000,
      details: {}
    }
  });

  console.log('Seed xong user NV001 / CCCD 123456');
}
main().catch(console.error).finally(() => process.exit(0));
