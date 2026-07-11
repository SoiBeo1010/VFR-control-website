# QMS System - Testing Guide

## Test Environment Setup

### Prerequisites
- MySQL running on localhost:3306
- FastAPI server running on localhost:8000
- Modern browser with developer tools

### Test Data
- Default users created automatically on first login
- Sample product IDs: PROD-001, PROD-002, PROD-003
- Sample batch numbers: BATCH-2024-001, BATCH-2024-002

---

## Functional Testing Checklist

### 1. Authentication Tests

#### Test 1.1: Login with Valid Credentials
```
Steps:
1. Navigate to http://localhost:8000
2. Enter username: qc_worker_1
3. Enter password: password123
4. Click Login

Expected Result:
✓ User is logged in
✓ Redirected to QC Worker dashboard
✓ Username displayed in navbar
✓ Token stored in localStorage
```

#### Test 1.2: Login with Invalid Credentials
```
Steps:
1. Navigate to http://localhost:8000
2. Enter username: qc_worker_1
3. Enter password: wrongpassword
4. Click Login

Expected Result:
✓ Error alert displayed: "Invalid credentials"
✓ User remains on login page
✓ No token generated
```

#### Test 1.3: Login with Empty Fields
```
Steps:
1. Navigate to http://localhost:8000
2. Leave username and password empty
3. Click Login

Expected Result:
✓ Browser validation message appears
✓ Form not submitted
✓ User remains on login page
```

#### Test 1.4: Session Persistence
```
Steps:
1. Login successfully
2. Close browser tab
3. Reopen http://localhost:8000

Expected Result:
✓ Dashboard loads (not redirected to login)
✓ User information still displayed
✓ Token still valid
```

#### Test 1.5: Logout Functionality
```
Steps:
1. Login successfully
2. Click Logout button
3. Try to access dashboard directly

Expected Result:
✓ Logged out successfully
✓ Redirected to login page
✓ LocalStorage cleared
✓ Cannot access protected pages
```

---

### 2. QC Worker Tests

#### Test 2.1: Create Inspection
```
Steps:
1. Login as qc_worker_1
2. Fill Product ID: PROD-001
3. Fill Batch Number: BATCH-2024-001
4. Click "Create Inspection"

Expected Result:
✓ Success message displayed
✓ Inspection added to history table
✓ New inspection available in dropdown
✓ Status shows "pending"
✓ "Total Inspections" stat updates
```

#### Test 2.2: Add Defect to Inspection
```
Steps:
1. Create inspection first (Test 2.1)
2. Select inspection from dropdown
3. Fill Defect Type: Scratch
4. Fill Description: Surface scratch on corner
5. Select Severity: High
6. Click "Add Defect"

Expected Result:
✓ Success message displayed
✓ Defect added successfully
✓ Can add multiple defects to same inspection
```

#### Test 2.3: Create Quarantine Report
```
Steps:
1. Create inspection and defect
2. Click "Create Quarantine Report"

Expected Result:
✓ Quarantine report created
✓ Inspection status changes to "quarantined"
✓ Report visible to QC Manager
```

#### Test 2.4: View Inspection History
```
Steps:
1. Create 3 inspections
2. Scroll to "Inspection History" section

Expected Result:
✓ All inspections displayed in table
✓ Shows Product ID, Batch, Date, Status
✓ Most recent first
✓ Stats updated correctly
```

#### Test 2.5: Dashboard Statistics
```
Steps:
1. Create inspections with different statuses
2. Review dashboard stats

Expected Result:
✓ "Total Inspections" shows correct count
✓ "Pending Inspections" shows pending count
✓ "Completed Inspections" shows completed count
✓ Stats update in real-time
```

---

### 3. QC Manager Tests

#### Test 3.1: View Quarantine Reports
```
Steps:
1. Login as qc_manager_1
2. Review "Quarantine Reports" section

Expected Result:
✓ All quarantine reports from QC Workers displayed
✓ Shows Product ID, Batch, Defect Type, Description
✓ Table populated with correct data
```

#### Test 3.2: Assign Problem Owner
```
Steps:
1. View quarantine reports
2. Click "Assign" button on a report
3. Select Problem Owner from dropdown
4. Select Repair Department
5. Select Priority: High
6. Click "Assign"

Expected Result:
✓ Assignment created successfully
✓ Success message displayed
✓ Modal closes
✓ Production Manager receives notification
```

#### Test 3.3: Assignment Validation
```
Steps:
1. Open assignment modal
2. Try to submit without selecting owner

Expected Result:
✓ Form validation prevents submission
✓ Error message displayed
```

#### Test 3.4: Multiple Assignments
```
Steps:
1. Create multiple quarantine reports
2. Assign different owners to each

Expected Result:
✓ Each assignment created independently
✓ All assignments visible to Production Manager
✓ Can track multiple assignments
```

---

### 4. Production Manager Tests

#### Test 4.1: View Notifications
```
Steps:
1. Login as prod_manager_1
2. Review "Issues Requiring Attention" section

Expected Result:
✓ Shows issues assigned from QC Manager
✓ Displays Product, Batch, Priority, Defect
✓ "Active Issues" stat shows correct count
```

#### Test 4.2: Create Repair Plan
```
Steps:
1. View notifications
2. Click "Create Plan" on an issue
3. Fill Plan Description: Step-by-step repair process
4. Fill Estimated Days: 2
5. Select Production Worker
6. Click "Create Plan"

Expected Result:
✓ Repair plan created successfully
✓ Success message displayed
✓ Modal closes
✓ Production Worker receives assignment
✓ "Pending Plans" stat updates
```

#### Test 4.3: Multiple Repair Plans
```
Steps:
1. Create 3 different repair plans
2. Check dashboard stats

Expected Result:
✓ Each plan created independently
✓ Correct assignment to different workers
✓ All visible to respective workers
```

---

### 5. Production Worker Tests

#### Test 5.1: View Assigned Repair Plans
```
Steps:
1. Login as prod_worker_1
2. Review "My Assigned Repair Plans" section

Expected Result:
✓ Shows only plans assigned to this worker
✓ Displays Product, Batch, Plan Details, Status
✓ "Assigned Plans" stat shows correct count
```

#### Test 5.2: Mark Repair as Complete
```
Steps:
1. View assigned repair plans
2. Click "Complete" on a plan
3. Fill Root Cause Analysis: Paint booth calibration issue
4. Fill Preventive Action: Schedule weekly calibration
5. Fill Actual Cost: 150.50
6. Click "Mark as Complete"

Expected Result:
✓ Repair marked as completed
✓ Success message displayed
✓ Plan status changes to "completed"
✓ Sent for approval
✓ Warehouse receives for review
```

#### Test 5.3: Cost Recording
```
Steps:
1. Complete repair with cost: 250.00
2. Complete another with cost: 175.50
3. Check Warehouse dashboard

Expected Result:
✓ Costs recorded accurately
✓ Total cost visible to Warehouse
✓ Cost calculations correct
```

#### Test 5.4: Multiple Completions
```
Steps:
1. Assign multiple plans to this worker
2. Complete all of them with different costs

Expected Result:
✓ Each completion processed independently
✓ All visible to Warehouse
✓ Costs tracked separately
✓ "Completed" stat accurate
```

---

### 6. Warehouse Tests

#### Test 6.1: View Pending Approvals
```
Steps:
1. Login as warehouse_1
2. Review "Repairs Pending Approval" section

Expected Result:
✓ Shows only completed repairs awaiting approval
✓ Displays Product, Batch, Root Cause, Cost
✓ "Pending Approvals" stat accurate
```

#### Test 6.2: Approve Repair
```
Steps:
1. View pending approvals
2. Click "Review" on a repair
3. Review all details in modal
4. Select Decision: Approve
5. Add Comments: Looks good, approved
6. Click "Submit Decision"

Expected Result:
✓ Approval recorded
✓ Success message displayed
✓ Repair removed from pending list
✓ "Approved" stat updates
✓ Total cost added to dashboard
```

#### Test 6.3: Reject Repair
```
Steps:
1. View pending approvals
2. Click "Review" on a repair
3. Select Decision: Reject
4. Add Comments: Need more details on prevention
5. Click "Submit Decision"

Expected Result:
✓ Rejection recorded
✓ Success message displayed
✓ Can be resubmitted
✓ Comments recorded
```

#### Test 6.4: Cost Tracking
```
Steps:
1. Approve 3 repairs with costs: 100, 200, 150
2. Check "Total Cost (USD)" stat

Expected Result:
✓ Shows: $450.00
✓ Updates dynamically as approvals added
✓ Accurate calculation
```

---

## Performance Testing

### Test 7.1: Dashboard Load Time
```
Steps:
1. Login and open any dashboard
2. Measure page load time
3. Check if stats load within 2 seconds

Expected Result:
✓ Page loads in < 2 seconds
✓ Stats display within 3 seconds
✓ No timeout errors
```

### Test 7.2: Real-time Updates
```
Steps:
1. Open dashboard in two browser windows
2. Create item in one window
3. Wait 5 seconds and check other window

Expected Result:
✓ New item appears in second window
✓ Stats update automatically
✓ No manual refresh needed
```

### Test 7.3: Multiple Concurrent Users
```
Steps:
1. Open system in 3 different browsers
2. Login with different roles
3. Perform operations simultaneously

Expected Result:
✓ All operations complete successfully
✓ No data corruption
✓ No conflicts
✓ No error messages
```

---

## Security Testing

### Test 8.1: Token Validation
```
Steps:
1. Login and get token
2. Manually remove token from localStorage
3. Try to access protected page

Expected Result:
✓ Redirected to login page
✓ Cannot access protected resources
```

### Test 8.2: CORS Headers
```
Steps:
1. Open browser console
2. Check network requests

Expected Result:
✓ CORS headers present
✓ Cross-origin requests allowed
✓ No CORS errors in console
```

### Test 8.3: SQL Injection
```
Steps:
1. Try entering SQL in form fields: ' OR '1'='1
2. Submit form

Expected Result:
✓ Input treated as text string
✓ No SQL injection occurs
✓ Data stored safely
```

### Test 8.4: Password Security
```
Steps:
1. Check password field in inspector

Expected Result:
✓ Type="password" on input field
✓ Passwords not visible in plain text
✓ Not logged in console
```

---

## API Testing

### Test 9.1: Health Check
```bash
curl http://localhost:8000/api/health

Expected Response:
{"status":"ok"}
```

### Test 9.2: Login API
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"qc_worker_1","password":"password123"}'

Expected Response:
{
  "token": "eyJ...",
  "user_id": 1,
  "username": "qc_worker_1",
  "role": "QC Worker"
}
```

### Test 9.3: Create Inspection
```bash
curl -X POST http://localhost:8000/api/qc-worker/inspection \
  -H "Content-Type: application/json" \
  -H "token: YOUR_TOKEN" \
  -d '{"product_id":"PROD-001","batch_number":"BATCH-001"}'

Expected Response:
{"inspection_id": 1, "status": "created"}
```

---

## Regression Testing Checklist

After any code changes:

- [ ] Can login with all 5 user roles
- [ ] Each role accesses correct dashboard
- [ ] Create inspection works
- [ ] Add defect works
- [ ] Create quarantine report works
- [ ] Assign owner works
- [ ] Create repair plan works
- [ ] Complete repair works
- [ ] Approve/reject repair works
- [ ] Statistics update correctly
- [ ] Real-time refresh works
- [ ] Logout works
- [ ] No console errors
- [ ] No network errors
- [ ] Responsive on mobile
- [ ] No data loss

---

## Browser Compatibility Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

---

## Test Report Template

```
Test Date: ____/____/____
Tester: _______________
Build Version: _________

Total Tests: ___
Passed: ___
Failed: ___
Blocked: ___

Critical Issues: _______
High Priority: ________
Medium Priority: _______
Low Priority: _________

Notes:
_______________________
_______________________
```

---

## Troubleshooting Tests

### If Login Fails
- [ ] MySQL server running?
- [ ] Database created?
- [ ] .env file configured?
- [ ] Server restarted?

### If Dashboard Doesn't Load
- [ ] Token valid?
- [ ] Role correct?
- [ ] API responding?
- [ ] Check browser console

### If Data Doesn't Save
- [ ] Database connection working?
- [ ] Tables created?
- [ ] Sufficient permissions?
- [ ] Check server logs

---

## Success Criteria

✅ All 50+ tests pass  
✅ No critical issues  
✅ Performance acceptable  
✅ Security validated  
✅ Cross-browser compatible  
✅ Responsive design working  
✅ Real-time features working  
✅ Data persists correctly  

---

**Testing Status**: Ready for QA

Complete this checklist before production deployment.
