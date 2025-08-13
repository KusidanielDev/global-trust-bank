PATCH NOTES (pro_v6)
- New rich dashboard: category spending pie, 12-week cashflow area, insights cards.
- Loans feature: Prisma model + /loans list and /loans/apply form.
- Deposit/Withdraw/Transfer forms: clearer headers and helper notes.
- Charts use 'recharts'. Install it with:  npm i recharts

After pulling these changes:
1) Run Prisma migrations (adds Loan model):
   npx prisma format
   npx prisma generate
   npx prisma migrate dev -n "add_loans"

2) Install recharts:
   npm i recharts

3) Start app:
   npm run dev
