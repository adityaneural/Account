import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { permissionCatalog } from '../src/identity/permission-catalog';

const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'default' },
    update: {},
    create: {
      name: 'Default Company',
      slug: 'default',
    },
  });

  for (const permission of permissionCatalog) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: permission,
      create: permission,
    });
  }

  const permissions = await prisma.permission.findMany();
  const adminRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'admin' } },
    update: { name: 'Admin', isSystem: true },
    create: {
      tenantId: tenant.id,
      name: 'Admin',
      code: 'admin',
      description: 'Full access to all modules.',
      isSystem: true,
    },
  });

  await prisma.rolePermission.createMany({
    data: permissions.map((permission) => ({ roleId: adminRole.id, permissionId: permission.id })),
    skipDuplicates: true,
  });

  const passwordHash = await hash('Admin@12345', 12);
  const adminUser = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@accounterp.local' } },
    update: { fullName: 'System Admin', status: 'ACTIVE' },
    create: {
      tenantId: tenant.id,
      email: 'admin@accounterp.local',
      fullName: 'System Admin',
      passwordHash,
      status: 'ACTIVE',
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: adminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: adminRole.id },
  });

  const company = await prisma.company.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'DEFAULT' } },
    update: {},
    create: {
      tenantId: tenant.id,
      name: 'Default Company',
      legalName: 'Default Company',
      code: 'DEFAULT',
      country: 'India',
      financialYearStart: new Date('2026-04-01'),
      booksStartDate: new Date('2026-04-01'),
    },
  });

  const branch = await prisma.branch.upsert({
    where: { companyId_code: { companyId: company.id, code: 'HO' } },
    update: {},
    create: {
      companyId: company.id,
      name: 'Head Office',
      code: 'HO',
      country: 'India',
      isPrimary: true,
    },
  });

  await prisma.warehouse.upsert({
    where: { branchId_code: { branchId: branch.id, code: 'MAIN' } },
    update: {},
    create: {
      branchId: branch.id,
      name: 'Main Godown',
      code: 'MAIN',
      isPrimary: true,
    },
  });

  for (const series of [
    { module: 'sales_invoice', prefix: 'SI-', nextNumber: 1, padding: 5 },
    { module: 'purchase_invoice', prefix: 'PI-', nextNumber: 1, padding: 5 },
    { module: 'journal_voucher', prefix: 'JV-', nextNumber: 1, padding: 5 },
  ]) {
    await prisma.voucherSeries.upsert({
      where: { companyId_module_prefix: { companyId: company.id, module: series.module, prefix: series.prefix } },
      update: {},
      create: {
        companyId: company.id,
        ...series,
      },
    });
  }

  for (const voucherType of [
    { name: 'Journal', code: 'journal', category: 'accounting', prefix: 'JV-', nextNumber: 1, padding: 5 },
    { name: 'Payment', code: 'payment', category: 'accounting', prefix: 'PAY-', nextNumber: 1, padding: 5 },
    { name: 'Receipt', code: 'receipt', category: 'accounting', prefix: 'REC-', nextNumber: 1, padding: 5 },
    { name: 'Contra', code: 'contra', category: 'accounting', prefix: 'CON-', nextNumber: 1, padding: 5 },
    { name: 'Debit Note', code: 'debit_note', category: 'accounting', prefix: 'DN-', nextNumber: 1, padding: 5 },
    { name: 'Credit Note', code: 'credit_note', category: 'accounting', prefix: 'CN-', nextNumber: 1, padding: 5 },
    { name: 'Sales Invoice', code: 'sales_invoice', category: 'sales', prefix: 'SI-', nextNumber: 1, padding: 5 },
    { name: 'Purchase Invoice', code: 'purchase_invoice', category: 'purchase', prefix: 'PI-', nextNumber: 1, padding: 5 },
  ]) {
    await prisma.voucherType.upsert({
      where: { companyId_code: { companyId: company.id, code: voucherType.code } },
      update: voucherType,
      create: { companyId: company.id, ...voucherType, isSystem: true },
    });
  }

  for (const taxRate of [
    { name: 'GST Exempt / Nil Rated', code: 'GST_0', rate: 0, cgstRate: 0, sgstRate: 0, igstRate: 0 },
    { name: 'GST 5%', code: 'GST_5', rate: 5, cgstRate: 2.5, sgstRate: 2.5, igstRate: 5 },
    { name: 'GST 12%', code: 'GST_12', rate: 12, cgstRate: 6, sgstRate: 6, igstRate: 12 },
    { name: 'GST 18%', code: 'GST_18', rate: 18, cgstRate: 9, sgstRate: 9, igstRate: 18 },
    { name: 'GST 28%', code: 'GST_28', rate: 28, cgstRate: 14, sgstRate: 14, igstRate: 28 },
  ]) {
    await prisma.taxRate.upsert({
      where: { companyId_code: { companyId: company.id, code: taxRate.code } },
      update: taxRate,
      create: { companyId: company.id, ...taxRate },
    });
  }

  const groups = [
    { name: 'Capital Account', code: 'CAPITAL', nature: 'EQUITY' },
    { name: 'Bank Accounts', code: 'BANK_ACCOUNTS', nature: 'ASSET' },
    { name: 'Cash-in-Hand', code: 'CASH_IN_HAND', nature: 'ASSET' },
    { name: 'Current Assets', code: 'CURRENT_ASSETS', nature: 'ASSET' },
    { name: 'Current Liabilities', code: 'CURRENT_LIABILITIES', nature: 'LIABILITY' },
    { name: 'Direct Expenses', code: 'DIRECT_EXPENSES', nature: 'EXPENSE' },
    { name: 'Direct Income', code: 'DIRECT_INCOME', nature: 'INCOME' },
    { name: 'Indirect Expenses', code: 'INDIRECT_EXPENSES', nature: 'EXPENSE' },
    { name: 'Indirect Income', code: 'INDIRECT_INCOME', nature: 'INCOME' },
    { name: 'Duties & Taxes', code: 'DUTIES_TAXES', nature: 'LIABILITY' },
    { name: 'Sundry Debtors', code: 'SUNDRY_DEBTORS', nature: 'ASSET' },
    { name: 'Sundry Creditors', code: 'SUNDRY_CREDITORS', nature: 'LIABILITY' },
  ] as const;

  for (const group of groups) {
    await prisma.accountGroup.upsert({
      where: { companyId_code: { companyId: company.id, code: group.code } },
      update: {},
      create: { companyId: company.id, ...group, isSystem: true },
    });
  }

  const currentAssets = await prisma.accountGroup.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'CURRENT_ASSETS' } } });
  const bankAccounts = await prisma.accountGroup.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'BANK_ACCOUNTS' } } });
  const cashInHand = await prisma.accountGroup.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'CASH_IN_HAND' } } });
  const capital = await prisma.accountGroup.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'CAPITAL' } } });

  for (const ledger of [
    { name: 'Main Cash', code: 'MAIN_CASH', groupId: cashInHand.id, ledgerType: 'CASH', openingBalance: 0, openingType: 'DEBIT' },
    { name: 'Petty Cash', code: 'PETTY_CASH', groupId: cashInHand.id, ledgerType: 'CASH', openingBalance: 0, openingType: 'DEBIT' },
    { name: 'SBI Bank', code: 'SBI_BANK', groupId: bankAccounts.id, ledgerType: 'BANK', bankName: 'State Bank of India', openingBalance: 0, openingType: 'DEBIT' },
    { name: 'HDFC Bank', code: 'HDFC_BANK', groupId: bankAccounts.id, ledgerType: 'BANK', bankName: 'HDFC Bank', openingBalance: 0, openingType: 'DEBIT' },
    { name: 'Owner Capital', code: 'OWNER_CAPITAL', groupId: capital.id, ledgerType: 'CAPITAL', openingBalance: 0, openingType: 'CREDIT' },
    { name: 'Cash', code: 'CASH', groupId: currentAssets.id, ledgerType: 'CASH', openingBalance: 0, openingType: 'DEBIT' },
    { name: 'Bank', code: 'BANK', groupId: bankAccounts.id, ledgerType: 'BANK', openingBalance: 0, openingType: 'DEBIT' },
    { name: 'Capital', code: 'CAPITAL_LEDGER', groupId: capital.id, ledgerType: 'CAPITAL', openingBalance: 0, openingType: 'CREDIT' },
  ] as const) {
    await prisma.ledger.upsert({
      where: { companyId_code: { companyId: company.id, code: ledger.code } },
      update: ledger,
      create: { companyId: company.id, ...ledger, isActive: true },
    });
  }

  for (const unit of [
    { name: 'Numbers', code: 'NOS', decimalPlaces: 0 },
    { name: 'Kilogram', code: 'KG', decimalPlaces: 3 },
    { name: 'Meter', code: 'MTR', decimalPlaces: 2 },
    { name: 'Piece', code: 'PCS', decimalPlaces: 0 },
  ]) {
    await prisma.unit.upsert({
      where: { companyId_code: { companyId: company.id, code: unit.code } },
      update: unit,
      create: { companyId: company.id, ...unit },
    });
  }

  for (const group of [
    { name: 'Raw Materials', code: 'RAW' },
    { name: 'Finished Goods', code: 'FINISHED' },
    { name: 'Packing Materials', code: 'PACKING' },
  ]) {
    await prisma.itemGroup.upsert({
      where: { companyId_code: { companyId: company.id, code: group.code } },
      update: group,
      create: { companyId: company.id, ...group },
    });
  }

  const kg = await prisma.unit.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'KG' } } });
  const pcs = await prisma.unit.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'PCS' } } });
  const raw = await prisma.itemGroup.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'RAW' } } });
  const finished = await prisma.itemGroup.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'FINISHED' } } });
  const mainWarehouse = await prisma.warehouse.findUniqueOrThrow({ where: { branchId_code: { branchId: branch.id, code: 'MAIN' } } });

  for (const item of [
    { name: 'MS Sheet 2mm', code: 'MS-SHEET-2MM', unitId: kg.id, groupId: raw.id, hsnSac: '7208', standardRate: 75, reorderLevel: 100 },
    { name: 'Finished Panel', code: 'FIN-PANEL', unitId: pcs.id, groupId: finished.id, hsnSac: '8538', standardRate: 1250, reorderLevel: 10 },
  ]) {
    const savedItem = await prisma.item.upsert({
      where: { companyId_code: { companyId: company.id, code: item.code } },
      update: item,
      create: { companyId: company.id, ...item },
    });

    const existingOpening = await prisma.stockMovement.findFirst({
      where: { itemId: savedItem.id, warehouseId: mainWarehouse.id, type: 'OPENING', referenceNo: `OPEN-${item.code}` },
    });
    if (!existingOpening) {
      const quantity = item.code === 'MS-SHEET-2MM' ? 500 : 25;
      await prisma.stockMovement.create({
        data: {
          itemId: savedItem.id,
          warehouseId: mainWarehouse.id,
          type: 'OPENING',
          quantity,
          rate: item.standardRate,
          amount: quantity * item.standardRate,
          movementDate: new Date('2026-04-01'),
          referenceType: 'opening',
          referenceNo: `OPEN-${item.code}`,
          narration: 'Opening stock',
        },
      });
    }
  }

  const sundryCreditors = await prisma.accountGroup.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'SUNDRY_CREDITORS' } } });
  const vendorLedger = await prisma.ledger.upsert({
    where: { companyId_code: { companyId: company.id, code: 'VENDOR_STEEL_SUPPLIER' } },
    update: { ledgerType: 'VENDOR', groupId: sundryCreditors.id },
    create: {
      companyId: company.id,
      groupId: sundryCreditors.id,
      name: 'Steel Supplier Co.',
      code: 'VENDOR_STEEL_SUPPLIER',
      ledgerType: 'VENDOR',
      openingType: 'CREDIT',
    },
  });

  await prisma.vendor.upsert({
    where: { companyId_code: { companyId: company.id, code: 'STEEL_SUPPLIER' } },
    update: {},
    create: {
      companyId: company.id,
      ledgerId: vendorLedger.id,
      name: 'Steel Supplier Co.',
      code: 'STEEL_SUPPLIER',
      state: 'Maharashtra',
    },
  });

  const sundryDebtors = await prisma.accountGroup.findUniqueOrThrow({ where: { companyId_code: { companyId: company.id, code: 'SUNDRY_DEBTORS' } } });
  const customerLedger = await prisma.ledger.upsert({
    where: { companyId_code: { companyId: company.id, code: 'CUSTOMER_ABC_INDUSTRIES' } },
    update: { ledgerType: 'CUSTOMER', groupId: sundryDebtors.id },
    create: {
      companyId: company.id,
      groupId: sundryDebtors.id,
      name: 'ABC Industries',
      code: 'CUSTOMER_ABC_INDUSTRIES',
      ledgerType: 'CUSTOMER',
      openingType: 'DEBIT',
    },
  });

  await prisma.customer.upsert({
    where: { companyId_code: { companyId: company.id, code: 'ABC_INDUSTRIES' } },
    update: {},
    create: {
      companyId: company.id,
      ledgerId: customerLedger.id,
      name: 'ABC Industries',
      code: 'ABC_INDUSTRIES',
      state: 'Maharashtra',
    },
  });

  console.log(`Seeded tenant ${tenant.slug}, company, accounting, inventory, GST, branch, warehouse, and voucher series`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
