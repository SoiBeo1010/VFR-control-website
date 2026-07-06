# Production Worker App - Data Import Guide

## Overview

The Production Worker App reads `public/inspection-data.json`. This repository also includes a real Excel source file: `data/OVerview of report inhouse (Fail).xlsx`. Use the importer below to convert that workbook into the JSON file the UI already consumes.

## Current Setup

- **App File**: `public/production-worker.html` (911 lines)
- **Data File**: `public/inspection-data.json` (5 sample tickets)
- **Chart Data**: Auto-populated from inspection data

## Data Sources Available

1. **Excel File**: `data/OVerview of report inhouse (Fail).xlsx` (source workbook used for import)
2. **Word Document**: `data/QC_Worker-32af27.docx` (9.5 KB)

## How to Import Data

### Option 1: Direct Excel to JSON Conversion

Use the bundled importer:

```bash
python import_inhouse_fail_to_json.py
```

#### Step 1: Extract data from Excel
```python
import openpyxl
import json

# Open Excel file
wb = openpyxl.load_workbook('data/OVerview of report inhouse (Fail).xlsx')
ws = wb.active

# Extract data
data = []
headers = None

for idx, row in enumerate(ws.iter_rows(values_only=True)):
    if idx == 0:
        headers = row
    else:
        if row[0] is not None:
            record = dict(zip(headers, row))
            data.append(record)

# Save to JSON
with open('public/inspection-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, default=str)

print(f"✓ Imported {len(data)} records")
```

#### Step 2: Verify data structure

Make sure each record has these fields (required):
```json
{
  "id": "TR2606-05494",
  "itemCode": "022297-AA",
  "itemName": "Item description",
  "wo": "61100",
  "priority": "High",
  "defectCode": "F-04",
  "defectDescription": "Description of defect",
  "correctiveAction": "How to fix it",
  "qtyQuarantine": 4,
  "deadline": "Today, 17:30",
  "fromDept": "Department name",
  "supplement": {
    "needed": false
  }
}
```

Optional fields:
```json
{
  "customer": "Customer name",
  "branch": "Branch code",
  "qtyOrder": 123,
  "defectOwner": "Owner code",
  "whereDetected": "Detection point",
  "preventiveAction": "Prevention plan",
  "crew": "2 workers",
  "branchRoute": "yes"
}
```

### Option 2: Database Integration (Recommended)

#### Step 1: Add API endpoint in `main.py`

```python
@app.get("/api/production-worker/tickets")
def get_production_worker_tickets(current_user: dict = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get repair tickets for production worker"""
    if current_user['role'] != 'Production Worker':
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    try:
        # Get failed inspections that need repair
        inspections = db.query(InspectionDB).filter(
            InspectionDB.status == 'failed',
            InspectionDB.qty_failed > 0
        ).all()
        
        tickets = []
        for inspection in inspections:
            # Get defects for this inspection
            defects = db.query(DefectListDB).filter(
                DefectListDB.inspection_id == inspection.inspection_id
            ).first()
            
            tickets.append({
                "id": inspection.inspection_id,
                "itemCode": inspection.product_id,
                "itemName": inspection.product_description,
                "wo": inspection.wo_number,
                "priority": "High" if defects and defects.severity == "Critical" else "Medium",
                "defectCode": defects.defect_code if defects else "UNKNOWN",
                "defectDescription": defects.defect_description if defects else "Unknown defect",
                "correctiveAction": inspection.corrective_action or "No action specified",
                "qtyQuarantine": inspection.qty_failed,
                "deadline": "Today, 18:00",
                "fromDept": inspection.inspection_stage,
                "supplement": {"needed": False}
            })
        
        return {"tickets": tickets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### Step 2: Update JavaScript in `production-worker.html`

Replace the fetch call:
```javascript
// Load inspection data from API instead of JSON file
fetch('/api/production-worker/tickets', {
    headers: { 'token': token }
})
    .then(res => res.json())
    .then(data => {
        inspectionData = data.tickets;
        initializeTickets();
        renderListView();
        startGlobalTimer();
    })
    .catch(err => console.error('Failed to load tickets:', err));
```

### Option 3: CSV to JSON Conversion

#### Step 1: Export Excel to CSV
1. Open Excel file in your spreadsheet application
2. File → Save As → Format: CSV (Comma Delimited)
3. Save as `inspection-data.csv`

#### Step 2: Convert CSV to JSON
```python
import csv
import json

with open('inspection-data.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    data = list(reader)

with open('public/inspection-data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f"✓ Converted {len(data)} CSV rows to JSON")
```

## Data Mapping Reference

Your Excel columns → inspection-data.json fields:

| Excel Column | JSON Field | Required | Example |
|---|---|---|---|
| Report/Ticket ID | `id` | Yes | "TR2606-05494" |
| Item Code | `itemCode` | Yes | "022297-AA" |
| Item Description | `itemName` | Yes | "Nightstand 28 inch" |
| Work Order | `wo` | Yes | "61100" |
| Defect Code | `defectCode` | Yes | "F-04" |
| Defect Description | `defectDescription` | Yes | "Adhesion not good enough" |
| Corrective Action | `correctiveAction` | Yes | "Re-glue joint..." |
| Qty Defective | `qtyQuarantine` | Yes | 4 |
| Priority | `priority` | Yes | "High" / "Medium" / "Low" |
| Deadline | `deadline` | Yes | "Today, 17:30" |
| From Department | `fromDept` | Yes | "Assembly Line 3" |
| Parts Needed | `supplement.needed` | No | true / false |
| Part Name | `supplement.partName` | Conditional | "M6 lock screws" |
| Part Qty | `supplement.qty` | Conditional | 1 |
| Part Status | `supplement.status` | Conditional | "waiting" / "arrived" |
| Part Location | `supplement.location` | Conditional | "Bin C-12" |

## Testing the Import

After updating `public/inspection-data.json`:

1. **Refresh browser** (Ctrl+R)
2. **Login as Production Worker**
3. **Check ticket list** - should show your imported data
4. **Click a ticket** - should display all fields correctly
5. **Start repair** - timer should work
6. **Check sidebar stats** - should update

## Troubleshooting

### Charts are empty
- Ensure `inspection-data.json` is valid JSON
- Check browser console (F12) for errors
- Verify data format matches structure above

### Tickets not loading
- Check file permissions on `public/inspection-data.json`
- Ensure JSON is valid (use jsonlint.com to validate)
- Check network tab (F12) - should see 200 OK response

### Data shows but charts don't update
- Refresh the page (Ctrl+R)
- Check that all required fields are present
- Ensure priority is one of: "High", "Medium", "Low"

## Sample Data Structure

See `public/inspection-data.json` for reference. Contains 5 sample tickets with full structure.

## Need Help?

1. Check data against JSON schema above
2. Validate JSON at jsonlint.com
3. Use Python script to verify extraction
4. Test with small sample (5-10 records) first
5. Scale up once working

---

**Last Updated**: June 30, 2026
**Version**: 1.0
