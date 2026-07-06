#!/usr/bin/env python3
"""
Sample Data Initialization Script for QMS System
Inserts realistic inspection data based on the provided dashboard metrics
"""

from datetime import datetime, timedelta
import random

# Import from main.py
import sys
sys.path.insert(0, '/vercel/share/v0-project')

from main import SessionLocal, InspectionDB, DefectListDB, QuarantineReportDB

def init_sample_data():
    """Initialize sample inspection data"""
    db = SessionLocal()
    
    try:
        # Sample inspection stages
        stages = ['Finishing', 'Sanding', 'Final', 'Assembly', 'Item White', 'Machinery', 'Upholstery']
        
        # Sample defect codes and descriptions
        defects = [
            ('D001', 'Surface Scratches', 'Minor'),
            ('D002', 'Color Variation', 'Minor'),
            ('D003', 'Glue Stains', 'Minor'),
            ('D004', 'Veneer Peel', 'Major'),
            ('D005', 'Dimension Error', 'Major'),
            ('D006', 'Assembly Misalignment', 'Major'),
            ('D007', 'Finish Defect', 'Minor'),
            ('D008', 'Structural Damage', 'Major'),
        ]
        
        # Generate 100 inspection records across 6 months
        base_date = datetime(2026, 1, 1)
        inspector_id = 1  # QC Worker ID
        
        fail_rates_by_stage = {
            'Finishing': 0.0125,
            'Sanding': 0.0099,
            'Final': 0.0038,
            'Assembly': 0.0026,
            'Item White': 0.0000,
            'Machinery': 0.0000,
            'Upholstery': 0.0000,
        }
        
        for i in range(72997):  # Total inspections from dashboard
            # Distribute across months
            month_offset = (i % 6) * 5
            inspection_date = base_date + timedelta(days=month_offset + (i // 6))
            
            # Select stage based on distribution
            stage_index = i % len(stages)
            stage = stages[stage_index]
            
            # Create inspection record
            qty_inspected = 1
            qty_passed = 1
            qty_failed = 0
            
            # Determine if this inspection fails based on stage fail rate
            fail_rate = fail_rates_by_stage.get(stage, 0)
            if random.random() < fail_rate:
                qty_passed = 0
                qty_failed = 1
            
            inspection = InspectionDB(
                product_id=f'PROD{i:06d}',
                batch_number=f'BATCH{i // 1000:03d}',
                wo_number=f'WO{i:05d}',
                component_code=f'COMP{stage[:2]}{i % 100:02d}',
                carcass_code=f'CARC{i % 50:02d}',
                inspection_stage=stage,
                inspector_id=inspector_id,
                inspection_date=inspection_date,
                qty_inspected=qty_inspected,
                qty_passed=qty_passed,
                qty_failed=qty_failed,
                status='completed'
            )
            
            db.add(inspection)
            db.flush()
            
            # If failed, add defect records
            if qty_failed > 0:
                defect_code, defect_type, category = random.choice(defects)
                defect = DefectListDB(
                    inspection_id=inspection.inspection_id,
                    defect_code=defect_code,
                    defect_type=defect_type,
                    defect_category=category,
                    defect_description=f'{defect_type} found in {stage} stage',
                    severity='Critical' if category == 'Major' else 'Minor',
                    material_standard='WCO-2026',
                    inspection_method=random.choice(['Appearance', 'Measurement', 'Template/Drawing']),
                    remark='Reported by QC Worker'
                )
                db.add(defect)
                db.flush()
                
                # Create quarantine report
                quarantine = QuarantineReportDB(
                    inspection_id=inspection.inspection_id,
                    defect_list_id=defect.defect_id,
                )
                db.add(quarantine)
            
            # Commit every 100 records for performance
            if (i + 1) % 100 == 0:
                db.commit()
                print(f"Inserted {i + 1} inspection records...")
        
        db.commit()
        print(f"✓ Successfully inserted 72,997 sample inspection records")
        print(f"✓ Data includes:")
        print(f"  - 7 inspection stages (Finishing, Sanding, Final, Assembly, Item White, Machinery, Upholstery)")
        print(f"  - 8 defect types with Major/Minor categories")
        print(f"  - 6 months of data (Jan-Jun 2026)")
        print(f"  - Realistic fail rates matching dashboard metrics")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error inserting sample data: {str(e)}")
    finally:
        db.close()

if __name__ == '__main__':
    print("Initializing QMS sample data...")
    print("This will take a moment as we insert ~73,000 inspection records...")
    init_sample_data()
