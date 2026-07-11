# QMS System - Quality Management System

A complete Quality Management System (QMS) web application built with FastAPI backend and HTML/CSS frontend, designed to manage quality inspections, defect tracking, repairs, and approvals across multiple departments.

## System Overview

The QMS system follows a complete workflow from inspection through approval:

1. **QC Worker** → Creates inspections and defect lists
2. **QC Manager** → Reviews quarantine reports and assigns owners
3. **Production Manager** → Creates repair plans
4. **Production Worker** → Completes repairs and records root causes
5. **Warehouse** → Approves or rejects completed repairs

## Features

### Role-Based Access Control
- **QC Worker**: Perform inspections, create defect lists, generate quarantine reports
- **QC Manager**: Manage quarantine reports, assign problem owners and repair departments
- **Production Manager**: Create and manage repair plans, assign to production workers
- **Production Worker**: Execute repairs, document root causes and preventive actions
- **Warehouse**: Review and approve completed repairs

### Core Functionality
- Product inspection and defect documentation
- Batch tracking and quarantine management
- Repair planning and execution
- Root cause analysis and preventive actions
- Cost management for repairs
- Approval workflows
- Real-time dashboards with statistics
- JWT-based authentication

## System Requirements

- Python 3.8+
- MySQL Server 5.7+
- Modern web browser (Chrome, Firefox, Safari, Edge)

## Installation

### 1. Install Dependencies

```bash
# Using pip
pip install -r requirements.txt

# Or using uv (if installed)
uv pip install -r requirements.txt
```

### 2. Setup Database

Ensure MySQL is running and create the database:

```bash
mysql -u root -p
CREATE DATABASE qms_system;
EXIT;
```

### 3. Configure Environment Variables

Copy the example file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=qms_system
SECRET_KEY=your-secret-key-change-in-production
```

### 4. Start the FastAPI Server

```bash
# Using Python
python main.py

# Or using uvicorn directly
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The server will start on `http://localhost:8000`

### 5. Access the Frontend

Open your browser and navigate to:
```
http://localhost:8000
```

## Default User Credentials

Use these credentials to login and test each role:

| Role | Username | Password |
|------|----------|----------|
| QC Worker | qc_worker_1 | password123 |
| QC Manager | qc_manager_1 | password123 |
| Production Manager | prod_manager_1 | password123 |
| Production Worker | prod_worker_1 | password123 |
| Warehouse | warehouse_1 | password123 |

**Important**: Change these passwords in production!

## Project Structure

```
qms-system/
├── main.py                      # FastAPI application and API endpoints
├── public/                      # Frontend HTML/CSS files
│   ├── index.html              # Login page
│   ├── qc-worker.html          # QC Worker dashboard
│   ├── qc-manager.html         # QC Manager dashboard
│   ├── production-manager.html  # Production Manager dashboard
│   ├── production-worker.html   # Production Worker dashboard
│   ├── warehouse.html          # Warehouse dashboard
│   └── styles.css              # Global CSS styles
├── .env.example                # Environment variables template
├── requirements.txt            # Python dependencies
└── README.md                   # This file
```

## API Endpoints

### Authentication
- `POST /api/login` - User login

### Database
- `GET /api/init-db` - Initialize database (called automatically on first load)

### QC Worker Endpoints
- `POST /api/qc-worker/inspection` - Create new inspection
- `POST /api/qc-worker/defect-list` - Add defect to inspection
- `POST /api/qc-worker/quarantine` - Create quarantine report
- `GET /api/qc-worker/inspections` - Get all inspections

### QC Manager Endpoints
- `GET /api/qc-manager/quarantine-reports` - Get all quarantine reports
- `POST /api/qc-manager/owner-assignment` - Assign problem owner

### Production Manager Endpoints
- `GET /api/production-manager/notifications` - Get notifications
- `POST /api/production-manager/repair-plan` - Create repair plan

### Production Worker Endpoints
- `GET /api/production-worker/repair-plans` - Get assigned repair plans
- `POST /api/production-worker/repair-completion` - Mark repair as complete

### Warehouse Endpoints
- `GET /api/warehouse/repairs-for-approval` - Get repairs pending approval
- `POST /api/warehouse/approve-repair` - Approve or reject repair

## Database Schema

### Users Table
Stores user information with role-based access

### Inspections Table
Records product inspections with inspector details

### Defect List Table
Stores identified defects linked to inspections

### Quarantine Report Table
Tracks quarantined products and associated defects

### Owner Assignment Table
Maps problem owners and repair departments to issues

### Repair Plan Table
Stores repair plans with estimated timeline

### Approval Table
Records approval decisions and comments

### Repair Completion Table
Tracks completed repairs with root cause analysis

### Cost Management Table
Monitors repair costs and resource allocation

## Workflow Example

1. **QC Worker** inspects a product and finds scratches
   - Creates inspection record
   - Adds defect entry (Scratch, Severity: High)
   - Creates quarantine report

2. **QC Manager** reviews the quarantine report
   - Assigns John Smith as problem owner
   - Assigns to Mechanical repair department
   - Sets priority as High

3. **Production Manager** receives notification
   - Creates repair plan with steps
   - Assigns to Production Worker 1
   - Sets 2 days estimated completion

4. **Production Worker** executes repair
   - Follows repair plan steps
   - Completes repair in 1.5 days
   - Documents root cause: "Manufacturing defect in paint booth"
   - Proposes preventive action: "Calibrate paint booth equipment"
   - Records actual cost: $150

5. **Warehouse** reviews
   - Reviews root cause and preventive actions
   - Approves the repair
   - Repair process completes

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS enabled for frontend communication
- Secure API endpoints with token validation

## Troubleshooting

### Database Connection Error
- Ensure MySQL server is running
- Verify credentials in `.env` file
- Check database exists: `SHOW DATABASES;`

### CORS Error in Browser
- Make sure FastAPI server is running on `http://localhost:8000`
- Check frontend URLs match the API base URL in HTML files

### Login Issues
- Run `/api/init-db` endpoint first to create database schema
- Verify user credentials match the default users
- Clear browser cache and try again

### API Not Responding
- Restart FastAPI server: `Ctrl+C` then `python main.py`
- Check server logs for errors
- Verify port 8000 is not in use

## Performance Optimization

- Dashboards refresh every 5 seconds for real-time updates
- Implement pagination for large datasets (future enhancement)
- Add caching for frequently accessed data
- Optimize database queries with indexes

## Future Enhancements

- Advanced reporting and analytics
- Email notifications for workflow steps
- Barcode scanning integration
- Mobile app support
- Multi-language support
- Audit logging and compliance reporting
- Integration with ERP systems
- Dashboard customization per role

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API endpoint documentation
3. Check browser console for JavaScript errors
4. Review server logs for backend errors

## License

This QMS system is provided as-is for quality management purposes.

---

**Last Updated**: June 2026
**Version**: 1.0.0
