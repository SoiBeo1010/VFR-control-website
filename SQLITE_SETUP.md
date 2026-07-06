# QMS System - SQLite Setup Guide

## What Changed?

The system has been converted from MySQL to **SQLite**. This means:

✅ **No database installation needed**  
✅ **No database server required**  
✅ **Automatic database file creation**  
✅ **Perfect for development and testing**  

---

## Quick Setup (5 Steps)

### Step 1: Open Terminal in VS Code

Make sure you're in the project directory (`qms-web-system-flow`)

### Step 2: Create Virtual Environment

```bash
python -m venv venv
```

### Step 3: Activate Virtual Environment

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- fastapi
- uvicorn
- sqlalchemy (for SQLite)
- bcrypt
- PyJWT
- Other required packages

### Step 5: Run the Server

```bash
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

---

## Access the Application

1. Open your browser
2. Go to: **http://localhost:8000**
3. Login with demo credentials:

| Role | Username | Password |
|------|----------|----------|
| QC Worker | qc_worker_1 | password123 |
| QC Manager | qc_manager_1 | password123 |
| Production Manager | prod_manager_1 | password123 |
| Production Worker | prod_worker_1 | password123 |
| Higher Department | higher_dept_1 | password123 |

---

## How SQLite Works

### Automatic Database Creation

When you first run the app:
1. A file called `qms_system.db` is created automatically
2. All tables are created automatically
3. Default users are added automatically
4. Everything is ready to use!

### Where is the Database?

The file `qms_system.db` is in your project folder:
```
qms-web-system-flow/
├── main.py
├── requirements.txt
├── qms_system.db  ← Here! (created automatically)
├── public/
│   ├── index.html
│   ├── styles.css
│   └── ...
└── ...
```

### Reset the Database

If you want to start fresh, just delete `qms_system.db`:

```bash
# On macOS/Linux:
rm qms_system.db

# On Windows (PowerShell):
Remove-Item qms_system.db

# Or just delete it manually in file explorer
```

Then run the app again - a new database will be created!

---

## Troubleshooting

### Error: "ModuleNotFoundError: No module named 'sqlalchemy'"

**Solution:**
```bash
pip install -r requirements.txt
```

### Error: "Address already in use"

The server is already running on port 8000. Either:
- Close the other terminal running the server
- Or stop it with `Ctrl+C` first

### Error: "No module named 'fastapi'"

Make sure you activated the virtual environment:

**macOS/Linux:**
```bash
source venv/bin/activate
```

**Windows:**
```bash
venv\Scripts\activate
```

Check if you see `(venv)` at the start of your terminal line.

### The database file is too large / I want to clear it

Just delete `qms_system.db` and run the app again. A fresh one will be created!

---

## What's Different from MySQL Version?

| Feature | MySQL | SQLite |
|---------|-------|--------|
| Installation | Required | Not needed |
| Server | Separate service | Embedded file |
| Setup | Complex | Automatic |
| File location | Separate DB server | `qms_system.db` file |
| Backup | mysqldump command | Copy the `.db` file |
| Performance | Faster for large data | Perfect for dev/test |

---

## Testing the System

After login, you can immediately test:

### QC Worker Test:
1. Create an inspection
2. Add defects to it
3. Create a quarantine report

### QC Manager Test:
1. Review quarantine reports
2. Assign problem owner and repair department
3. Set priority

### Production Manager Test:
1. View notifications
2. Create repair plan
3. Assign to production worker

### Production Worker Test:
1. View assigned repair plans
2. Complete repair
3. Document root cause and cost

### Higher Department Test:
1. View repairs for approval
2. Review root cause and preventive action
3. Approve or reject

---

## Next Steps

1. ✅ Run the application (see above)
2. Test each user role
3. Check the complete documentation in `README.md`
4. When ready for production, see `DEPLOYMENT.md`

---

## Need Help?

Check these files:
- `README.md` - Complete system documentation
- `QUICKSTART.md` - Fast setup guide
- `DEPLOYMENT.md` - Production deployment
- `TESTING.md` - Testing procedures

---

**Happy testing!** 🚀

Thích không cần cài MySQL hay SQL Server nữa? SQLite đây rồi!
