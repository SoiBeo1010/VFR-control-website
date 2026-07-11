# QMS System - Quick Start Guide

## ⚡ 30-Second Setup

### Prerequisites
- Python 3.8+
- MySQL Server running locally (on port 3306)

### Step 1: Install Dependencies
```bash
cd /vercel/share/v0-project
pip install -r requirements.txt
```

### Step 2: Create Database
```bash
mysql -u root -p
CREATE DATABASE qms_system;
EXIT;
```

### Step 3: Configure Environment
```bash
cp .env.example .env
# Edit .env with your MySQL credentials
```

### Step 4: Run the Server
```bash
python main.py
```

### Step 5: Access the System
Open browser and go to: **http://localhost:8000**

---

## 🔐 Login Credentials

Use any of these to test different roles:

```
QC Worker:         qc_worker_1 / password123
QC Manager:        qc_manager_1 / password123
Prod Manager:      prod_manager_1 / password123
Prod Worker:       prod_worker_1 / password123
Higher Dept:       higher_dept_1 / password123
```

---

## 📋 Complete Workflow Test

### 1. **QC Worker** - Create Inspection
1. Login as `qc_worker_1`
2. Fill "Product ID" and "Batch Number"
3. Click "Create Inspection"
4. Add defect details
5. Submit

### 2. **QC Manager** - Assign Owner
1. Login as `qc_manager_1`
2. View quarantine reports
3. Click "Assign" on a report
4. Select problem owner and repair department
5. Submit

### 3. **Production Manager** - Create Plan
1. Login as `prod_manager_1`
2. View issues requiring attention
3. Click "Create Plan"
4. Fill repair plan details
5. Assign to production worker
6. Submit

### 4. **Production Worker** - Complete Repair
1. Login as `prod_worker_1`
2. View assigned repair plans
3. Click "Complete" on a plan
4. Enter root cause analysis
5. Enter preventive action
6. Record repair cost
7. Submit

### 5. **Warehouse** - Approve
1. Login as `warehouse_1`
2. View repairs pending approval
3. Click "Review"
4. Select "Approve" or "Reject"
5. Add comments if needed
6. Submit decision

---

## 🗂️ File Structure

```
main.py                    ← FastAPI Backend
public/
  ├── index.html          ← Login Page
  ├── qc-worker.html      ← QC Worker Dashboard
  ├── qc-manager.html     ← QC Manager Dashboard
  ├── production-manager.html  ← Production Manager Dashboard
  ├── production-worker.html   ← Production Worker Dashboard
  ├── warehouse.html      ← Warehouse Dashboard
  └── styles.css          ← All CSS Styles
```

---

## 🐛 Common Issues & Solutions

### "Cannot connect to MySQL"
```bash
# Make sure MySQL is running
mysql -u root -p
SHOW DATABASES;
EXIT;

# Update .env with correct credentials
```

### "Port 8000 already in use"
```bash
# Kill existing process and restart
fuser -k 8000/tcp
python main.py
```

### "Database not initialized"
- Visit `http://localhost:8000/api/init-db` in browser
- Database will be created automatically with default users

### "Login fails with valid credentials"
- Ensure server is running: `http://localhost:8000/api/health`
- Check browser console for errors (F12)
- Verify token is being stored in localStorage

---

## 📊 API Quick Reference

### Health Check
```bash
curl http://localhost:8000/api/health
```

### Initialize Database
```bash
curl http://localhost:8000/api/init-db
```

### Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"qc_worker_1","password":"password123"}'
```

---

## 🚀 Next Steps

After completing the workflow test:

1. **Customize Users**: Modify default credentials in `main.py` lines 252-258
2. **Update Database**: Change `DB_NAME`, `DB_USER`, `DB_PASSWORD` in `.env`
3. **Enable HTTPS**: Add SSL certificates for production
4. **Deploy**: Deploy to production server or cloud platform
5. **Integrate**: Connect to existing ERP or MES systems

---

## 📞 Need Help?

1. Check server logs for errors
2. Review browser console (Press F12)
3. Verify all environment variables in `.env`
4. Ensure MySQL is running and accessible
5. Check README.md for detailed documentation

---

**Ready to go!** 🎉

Start with QC Worker login at: http://localhost:8000
