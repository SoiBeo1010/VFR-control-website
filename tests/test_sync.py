import unittest
import os
import json
import sys
from pathlib import Path
from datetime import datetime

# Add the parent directory to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from main import (
    app,
    SessionLocal,
    InspectionDB,
    RepairCardSupplementLinkDB,
    sync_repair_cards_and_supplement_requests
)

class TestSupplementRepairSync(unittest.TestCase):
    def setUp(self):
        self.db = SessionLocal()
        from main import seed_test_data
        seed_test_data(self.db)

    def tearDown(self):
        self.db.close()

    def test_sample_repair_supplement_link_sync(self):
        # 1. Run sync explicitly
        sync_repair_cards_and_supplement_requests(self.db, force=True)

        # 2. Check JSON file data/inspection-control.json
        json_path = Path("data/inspection-control.json")
        self.assertTrue(json_path.exists(), "inspection-control.json should exist after sync")
        
        cards = json.loads(json_path.read_text(encoding="utf-8"))
        
        # Test Case 1: WO 8482 (Waiting HOD: Approved, Related HOD: Approved, BOD: Pending)
        # -> Expected: WAITING_MATERIAL, code: SRC-202607-0017
        card_8482 = next((c for c in cards if c.get("id") == "INH-2-8482"), None)
        self.assertIsNotNone(card_8482, "Inspection record for WO 8482 should be found")
        self.assertEqual(card_8482.get("repair_status"), "WAITING_MATERIAL")
        self.assertEqual(card_8482.get("supplement_request_code"), "SRC-202607-0017")
        self.assertTrue(card_8482.get("supplement", {}).get("needed"))
        self.assertEqual(card_8482.get("supplement", {}).get("status"), "waiting")

        # Test Case 2: WO 8315 (Waiting HOD: Approved, Related HOD: Approved, BOD: Pending)
        # -> Expected: WAITING_MATERIAL, code: SRC-202607-0010
        card_8315 = next((c for c in cards if c.get("id") == "INH-3-8315"), None)
        self.assertIsNotNone(card_8315, "Inspection record for WO 8315 should be found")
        self.assertEqual(card_8315.get("repair_status"), "WAITING_MATERIAL")
        self.assertEqual(card_8315.get("supplement_request_code"), "SRC-202607-0010")

        # Test Case 3: WO 8317 (Fully Approved: HOD: Approved, Related HOD: Approved, BOD: Approved)
        # -> Expected: IN_REPAIR, code: SRC-202606-0071
        card_8317 = next((c for c in cards if c.get("id") == "INH-4-8317"), None)
        self.assertIsNotNone(card_8317, "Inspection record for WO 8317 should be found")
        self.assertEqual(card_8317.get("repair_status"), "IN_REPAIR")
        self.assertEqual(card_8317.get("supplement_request_code"), "SRC-202606-0071")
        self.assertEqual(card_8317.get("supplement", {}).get("status"), "arrived")

        # 3. Check SQLite DB link table mapping entries
        db_links = self.db.query(RepairCardSupplementLinkDB).all()
        self.assertGreaterEqual(len(db_links), 3, "Database links should be created for seeded items")
        
        link_8482 = next((l for l in db_links if l.wo_no == "8482"), None)
        self.assertIsNotNone(link_8482)
        self.assertEqual(link_8482.supplement_request_code, "SRC-202607-0017")

        link_8317 = next((l for l in db_links if l.wo_no == "8317"), None)
        self.assertIsNotNone(link_8317)
        self.assertEqual(link_8317.supplement_request_code, "SRC-202606-0071")

if __name__ == "__main__":
    unittest.main()
