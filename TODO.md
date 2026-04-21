# Admin Panel Implementation TODO

## Status: [In Progress] 

## 1. Seeding & Auth [Priority 1 - ✅ COMPLETE]
- [x] Create `scripts/seed-admin.ts` for default admin (utkarsh@gmail.com / utkarsh@12345)
- [x] Add `/app/admin/login/page.tsx` with Supabase signInWithPassword
- [x] Enhance middleware.ts for admin-only /admin/* protection
- [x] Test: Signup → login → /admin access

## 2. Admin Layout & Dashboard [Priority 1 - ✅ COMPLETE]
- [x] Create `src/modules/admin/components/admin-sidebar.tsx`
- [x] Create `(admin)/layout.tsx` with sidebar
- [x] Enhance `/admin/page.tsx` with full metrics/charts

## 3. Core Management Modules [Priority 2]
- [ ] User Management: `/admin/users/page.tsx` + API
- [ ] Subscription Mgmt: `/admin/subscriptions/page.tsx` + API
- [ ] Score Mgmt: `/admin/scores/page.tsx` + API

## 4. Draw & Game Ops [Priority 2]
- [ ] Draw Config/Run: `/admin/draws/page.tsx` + expand APIs
- [ ] Prize Mgmt: `/admin/prizes/page.tsx`
- [ ] Charity CRUD: `/admin/charities/page.tsx`

## 5. Verification & Payouts [Priority 3]
- [ ] Winner Proofs: `/admin/proofs/page.tsx`
- [ ] Payouts: `/admin/payouts/page.tsx`

## 6. Advanced Features [Priority 3]
- [ ] Notifications Broadcast: `/admin/notifications/page.tsx`
- [ ] Analytics Charts: `/admin/analytics/page.tsx`
- [ ] Audit Logs: `/admin/audit/page.tsx`
- [ ] Security: Rate limiting, audit all actions

## 7. UI/Polish
- [ ] shadcn DataTable, modals, skeletons for all tables
- [ ] Responsive sidebar + mobile menu
- [ ] Confirmation dialogs for destructive ops

## Commands to run after each major step:
```
npm run db:push  # if schema changes
npm run dev
```

