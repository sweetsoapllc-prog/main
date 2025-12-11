#!/usr/bin/env python3
"""
Comprehensive Bills & Payments Feature Testing
Testing all CRUD operations, validation, edge cases, and data persistence
"""

import requests
import json
import sys
from datetime import datetime, timedelta
from typing import Dict, List, Any

class BillsPaymentsComprehensiveTester:
    def __init__(self, base_url="https://peace-keeper.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_id = "demo-user-123"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_bills = []
        self.test_results = []
        
    def log_test(self, name: str, success: bool, details: str = "", response_data: Any = None) -> bool:
        """Log test result with detailed information"""
        self.tests_run += 1
        result = {
            'name': name,
            'success': success,
            'details': details,
            'response_data': response_data
        }
        self.test_results.append(result)
        
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
            if details:
                print(f"   Details: {details}")
        else:
            print(f"❌ {name} - FAILED: {details}")
            if response_data:
                print(f"   Response: {response_data}")
        return success

    def cleanup_bills(self):
        """Clean up any bills created during testing"""
        for bill_id in self.created_bills:
            try:
                requests.delete(f"{self.api_url}/bills/{bill_id}")
            except:
                pass
        self.created_bills.clear()

    def test_1_full_crud_cycle(self):
        """Test 1: Full CRUD Cycle Test"""
        print("\n🔄 Test 1: Full CRUD Cycle Test")
        print("-" * 40)
        
        # Step 1: Add a new bill with all fields
        bill_data = {
            "user_id": self.user_id,
            "name": "Electric Bill - Comprehensive Test",
            "amount": 125.75,
            "due_date": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
            "recurring": True,
            "autopay": True,
            "frequency": "Monthly"
        }
        
        try:
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            if response.status_code == 200:
                bill = response.json()
                bill_id = bill.get("id")
                self.created_bills.append(bill_id)
                
                # Verify all fields are correct
                success = (
                    bill.get("name") == bill_data["name"] and
                    bill.get("amount") == bill_data["amount"] and
                    bill.get("due_date") == bill_data["due_date"] and
                    bill.get("recurring") == bill_data["recurring"] and
                    bill.get("autopay") == bill_data["autopay"] and
                    bill.get("frequency") == bill_data["frequency"] and
                    bill.get("paid") == False  # Should default to False
                )
                self.log_test("1.1 Create Bill with All Fields", success, 
                            f"Bill ID: {bill_id}, All fields match: {success}")
            else:
                self.log_test("1.1 Create Bill with All Fields", False, 
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("1.1 Create Bill with All Fields", False, str(e))
            return False

        # Step 2: Verify bill appears in bills list (upcoming bills)
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            if response.status_code == 200:
                bills = response.json()
                found_bill = next((b for b in bills if b.get("id") == bill_id), None)
                success = found_bill is not None and not found_bill.get("paid", True)
                self.log_test("1.2 Verify Bill in Upcoming Bills", success,
                            f"Found bill in list: {found_bill is not None}")
            else:
                self.log_test("1.2 Verify Bill in Upcoming Bills", False,
                            f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("1.2 Verify Bill in Upcoming Bills", False, str(e))
            return False

        # Step 3: Edit the bill (change name, amount, date)
        updated_data = {
            "user_id": self.user_id,
            "name": "Electric Bill - Updated Name",
            "amount": 150.00,
            "due_date": (datetime.now() + timedelta(days=20)).strftime("%Y-%m-%d"),
            "recurring": True,
            "autopay": False,
            "frequency": "Quarterly"
        }
        
        try:
            response = requests.patch(f"{self.api_url}/bills/{bill_id}", json=updated_data)
            if response.status_code == 200:
                updated_bill = response.json()
                success = (
                    updated_bill.get("name") == updated_data["name"] and
                    updated_bill.get("amount") == updated_data["amount"] and
                    updated_bill.get("due_date") == updated_data["due_date"] and
                    updated_bill.get("autopay") == updated_data["autopay"] and
                    updated_bill.get("frequency") == updated_data["frequency"]
                )
                self.log_test("1.3 Edit Bill Details", success,
                            f"All updates applied correctly: {success}")
            else:
                self.log_test("1.3 Edit Bill Details", False,
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("1.3 Edit Bill Details", False, str(e))
            return False

        # Step 4: Verify changes are saved correctly
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            if response.status_code == 200:
                bills = response.json()
                found_bill = next((b for b in bills if b.get("id") == bill_id), None)
                success = (
                    found_bill and
                    found_bill.get("name") == updated_data["name"] and
                    found_bill.get("amount") == updated_data["amount"]
                )
                self.log_test("1.4 Verify Changes Saved", success,
                            f"Changes persisted correctly: {success}")
            else:
                self.log_test("1.4 Verify Changes Saved", False,
                            f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("1.4 Verify Changes Saved", False, str(e))
            return False

        # Step 5: Mark the bill as paid
        try:
            response = requests.patch(f"{self.api_url}/bills/{bill_id}/pay")
            if response.status_code == 200:
                response_data = response.json()
                expected_message = "Bill marked as paid"
                success = expected_message in response_data.get("message", "")
                self.log_test("1.5 Mark Bill as Paid", success,
                            f"Response message: {response_data.get('message')}")
            else:
                self.log_test("1.5 Mark Bill as Paid", False,
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("1.5 Mark Bill as Paid", False, str(e))
            return False

        # Step 6: Verify it moves to "Paid Recently" section (paid=True)
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            if response.status_code == 200:
                bills = response.json()
                found_bill = next((b for b in bills if b.get("id") == bill_id), None)
                success = found_bill and found_bill.get("paid") == True
                self.log_test("1.6 Verify Bill Marked as Paid", success,
                            f"Bill paid status: {found_bill.get('paid') if found_bill else 'Not found'}")
            else:
                self.log_test("1.6 Verify Bill Marked as Paid", False,
                            f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("1.6 Verify Bill Marked as Paid", False, str(e))
            return False

        # Step 7: Delete the bill
        try:
            response = requests.delete(f"{self.api_url}/bills/{bill_id}")
            if response.status_code == 200:
                response_data = response.json()
                expected_message = "Bill deleted"
                success = expected_message in response_data.get("message", "")
                self.log_test("1.7 Delete Bill", success,
                            f"Response message: {response_data.get('message')}")
                if success:
                    self.created_bills.remove(bill_id)
            else:
                self.log_test("1.7 Delete Bill", False,
                            f"Status: {response.status_code}, Response: {response.text}")
                return False
        except Exception as e:
            self.log_test("1.7 Delete Bill", False, str(e))
            return False

        # Step 8: Verify it's removed from database
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            if response.status_code == 200:
                bills = response.json()
                found_bill = next((b for b in bills if b.get("id") == bill_id), None)
                success = found_bill is None
                self.log_test("1.8 Verify Bill Removed from Database", success,
                            f"Bill found in database: {found_bill is not None}")
            else:
                self.log_test("1.8 Verify Bill Removed from Database", False,
                            f"Status: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("1.8 Verify Bill Removed from Database", False, str(e))
            return False

        return True

    def test_2_validation_testing(self):
        """Test 2: Validation Testing"""
        print("\n✅ Test 2: Validation Testing")
        print("-" * 40)
        
        # Test empty name
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "",
                "amount": 100.0,
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            }
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            # Should fail validation - expecting 422 or 400
            success = response.status_code in [400, 422]
            self.log_test("2.1 Empty Name Validation", success,
                        f"Status: {response.status_code} (expected 400/422)")
        except Exception as e:
            self.log_test("2.1 Empty Name Validation", False, str(e))

        # Test empty date
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "Test Bill",
                "amount": 100.0,
                "due_date": ""
            }
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            success = response.status_code in [400, 422]
            self.log_test("2.2 Empty Date Validation", success,
                        f"Status: {response.status_code} (expected 400/422)")
        except Exception as e:
            self.log_test("2.2 Empty Date Validation", False, str(e))

        # Test empty amount
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "Test Bill",
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
                # Missing amount field
            }
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            success = response.status_code in [400, 422]
            self.log_test("2.3 Missing Amount Validation", success,
                        f"Status: {response.status_code} (expected 400/422)")
        except Exception as e:
            self.log_test("2.3 Missing Amount Validation", False, str(e))

        # Test negative amount
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "Test Bill",
                "amount": -50.0,
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            }
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            success = response.status_code in [400, 422]
            self.log_test("2.4 Negative Amount Validation", success,
                        f"Status: {response.status_code} (expected 400/422)")
        except Exception as e:
            self.log_test("2.4 Negative Amount Validation", False, str(e))

        # Test invalid amount (text)
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "Test Bill",
                "amount": "invalid_amount",
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")
            }
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            success = response.status_code in [400, 422]
            self.log_test("2.5 Invalid Amount Type Validation", success,
                        f"Status: {response.status_code} (expected 400/422)")
        except Exception as e:
            self.log_test("2.5 Invalid Amount Type Validation", False, str(e))

        return True

    def test_3_empty_state_scenarios(self):
        """Test 3: Empty State Scenarios"""
        print("\n📭 Test 3: Empty State Scenarios")
        print("-" * 40)
        
        # First, clean up any existing bills for clean test
        self.cleanup_bills()
        
        # Test with NO bills at all
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            if response.status_code == 200:
                bills = response.json()
                success = isinstance(bills, list) and len(bills) == 0
                self.log_test("3.1 No Bills State", success,
                            f"Bills list empty: {len(bills) == 0}, Type: {type(bills)}")
            else:
                self.log_test("3.1 No Bills State", False,
                            f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("3.1 No Bills State", False, str(e))

        # Create a paid bill for testing
        paid_bill_data = {
            "user_id": self.user_id,
            "name": "Already Paid Bill",
            "amount": 75.0,
            "due_date": (datetime.now() - timedelta(days=5)).strftime("%Y-%m-%d"),
            "recurring": False,
            "autopay": False,
            "frequency": "Monthly"
        }
        
        try:
            response = requests.post(f"{self.api_url}/bills", json=paid_bill_data)
            if response.status_code == 200:
                paid_bill = response.json()
                paid_bill_id = paid_bill.get("id")
                self.created_bills.append(paid_bill_id)
                
                # Mark it as paid
                pay_response = requests.patch(f"{self.api_url}/bills/{paid_bill_id}/pay")
                if pay_response.status_code == 200:
                    self.log_test("3.2 Create Paid Bill for Testing", True,
                                f"Paid bill created: {paid_bill_id}")
                else:
                    self.log_test("3.2 Create Paid Bill for Testing", False,
                                f"Failed to mark as paid: {pay_response.status_code}")
            else:
                self.log_test("3.2 Create Paid Bill for Testing", False,
                            f"Failed to create bill: {response.status_code}")
        except Exception as e:
            self.log_test("3.2 Create Paid Bill for Testing", False, str(e))

        # Test with ONLY paid bills (upcoming should be empty)
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            if response.status_code == 200:
                bills = response.json()
                upcoming_bills = [b for b in bills if not b.get("paid", False)]
                paid_bills = [b for b in bills if b.get("paid", False)]
                
                success = len(upcoming_bills) == 0 and len(paid_bills) > 0
                self.log_test("3.3 Only Paid Bills State", success,
                            f"Upcoming: {len(upcoming_bills)}, Paid: {len(paid_bills)}")
            else:
                self.log_test("3.3 Only Paid Bills State", False,
                            f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("3.3 Only Paid Bills State", False, str(e))

        # Create an upcoming bill
        upcoming_bill_data = {
            "user_id": self.user_id,
            "name": "Upcoming Water Bill",
            "amount": 45.0,
            "due_date": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d"),
            "recurring": True,
            "autopay": True,
            "frequency": "Monthly"
        }
        
        try:
            response = requests.post(f"{self.api_url}/bills", json=upcoming_bill_data)
            if response.status_code == 200:
                upcoming_bill = response.json()
                upcoming_bill_id = upcoming_bill.get("id")
                self.created_bills.append(upcoming_bill_id)
                
                # Test with ONLY upcoming bills
                response = requests.get(f"{self.api_url}/bills/{self.user_id}")
                if response.status_code == 200:
                    bills = response.json()
                    upcoming_bills = [b for b in bills if not b.get("paid", False)]
                    paid_bills = [b for b in bills if b.get("paid", False)]
                    
                    success = len(upcoming_bills) > 0 and len(paid_bills) > 0
                    self.log_test("3.4 Mixed Bills State", success,
                                f"Upcoming: {len(upcoming_bills)}, Paid: {len(paid_bills)}")
                else:
                    self.log_test("3.4 Mixed Bills State", False,
                                f"Status: {response.status_code}")
            else:
                self.log_test("3.4 Mixed Bills State", False,
                            f"Failed to create upcoming bill: {response.status_code}")
        except Exception as e:
            self.log_test("3.4 Mixed Bills State", False, str(e))

        return True

    def test_4_edge_cases(self):
        """Test 4: Edge Cases"""
        print("\n🔍 Test 4: Edge Cases")
        print("-" * 40)
        
        # Add multiple bills with different dates
        bills_data = [
            {
                "user_id": self.user_id,
                "name": "Internet Bill - Due Soon",
                "amount": 89.99,
                "due_date": (datetime.now() + timedelta(days=2)).strftime("%Y-%m-%d"),
                "frequency": "Monthly"
            },
            {
                "user_id": self.user_id,
                "name": "Phone Bill - Due Later",
                "amount": 65.00,
                "due_date": (datetime.now() + timedelta(days=15)).strftime("%Y-%m-%d"),
                "frequency": "Monthly"
            },
            {
                "user_id": self.user_id,
                "name": "Insurance - Quarterly",
                "amount": 450.00,
                "due_date": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%d"),
                "frequency": "Quarterly"
            },
            {
                "user_id": self.user_id,
                "name": "Annual Subscription",
                "amount": 120.00,
                "due_date": (datetime.now() + timedelta(days=60)).strftime("%Y-%m-%d"),
                "frequency": "Annually"
            }
        ]
        
        created_edge_bills = []
        
        # Create multiple bills
        for i, bill_data in enumerate(bills_data):
            try:
                response = requests.post(f"{self.api_url}/bills", json=bill_data)
                if response.status_code == 200:
                    bill = response.json()
                    bill_id = bill.get("id")
                    created_edge_bills.append(bill_id)
                    self.created_bills.append(bill_id)
                    success = True
                else:
                    success = False
                
                self.log_test(f"4.{i+1} Create Multiple Bill {i+1}", success,
                            f"Status: {response.status_code}, Bill: {bill_data['name']}")
            except Exception as e:
                self.log_test(f"4.{i+1} Create Multiple Bill {i+1}", False, str(e))

        # Verify they appear in correct sections (all should be upcoming initially)
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            if response.status_code == 200:
                bills = response.json()
                upcoming_bills = [b for b in bills if not b.get("paid", False)]
                success = len(upcoming_bills) >= len(created_edge_bills)
                self.log_test("4.5 Verify Multiple Bills in Upcoming", success,
                            f"Expected >= {len(created_edge_bills)}, Found: {len(upcoming_bills)}")
            else:
                self.log_test("4.5 Verify Multiple Bills in Upcoming", False,
                            f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("4.5 Verify Multiple Bills in Upcoming", False, str(e))

        # Test marking multiple bills as paid
        paid_count = 0
        for i, bill_id in enumerate(created_edge_bills[:2]):  # Pay first 2 bills
            try:
                response = requests.patch(f"{self.api_url}/bills/{bill_id}/pay")
                if response.status_code == 200:
                    paid_count += 1
                    success = True
                else:
                    success = False
                
                self.log_test(f"4.{6+i} Mark Multiple Bills as Paid {i+1}", success,
                            f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"4.{6+i} Mark Multiple Bills as Paid {i+1}", False, str(e))

        # Verify paid bills moved to paid section
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            if response.status_code == 200:
                bills = response.json()
                paid_bills = [b for b in bills if b.get("paid", False)]
                success = len(paid_bills) >= paid_count
                self.log_test("4.8 Verify Multiple Bills Marked as Paid", success,
                            f"Expected >= {paid_count}, Found: {len(paid_bills)}")
            else:
                self.log_test("4.8 Verify Multiple Bills Marked as Paid", False,
                            f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("4.8 Verify Multiple Bills Marked as Paid", False, str(e))

        # Test editing a paid bill
        if created_edge_bills:
            paid_bill_id = created_edge_bills[0]  # First bill should be paid
            try:
                updated_data = {
                    "user_id": self.user_id,
                    "name": "Edited Paid Bill",
                    "amount": 99.99,
                    "due_date": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d"),
                    "frequency": "Monthly"
                }
                response = requests.patch(f"{self.api_url}/bills/{paid_bill_id}", json=updated_data)
                success = response.status_code == 200
                self.log_test("4.9 Edit Paid Bill", success,
                            f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("4.9 Edit Paid Bill", False, str(e))

        # Test frequency dropdown values
        frequency_values = ["Monthly", "Quarterly", "Annually"]
        for i, frequency in enumerate(frequency_values):
            try:
                bill_data = {
                    "user_id": self.user_id,
                    "name": f"Test {frequency} Bill",
                    "amount": 100.0,
                    "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                    "frequency": frequency
                }
                response = requests.post(f"{self.api_url}/bills", json=bill_data)
                if response.status_code == 200:
                    bill = response.json()
                    bill_id = bill.get("id")
                    self.created_bills.append(bill_id)
                    success = bill.get("frequency") == frequency
                else:
                    success = False
                
                self.log_test(f"4.{10+i} Test Frequency {frequency}", success,
                            f"Status: {response.status_code}, Frequency set: {frequency}")
            except Exception as e:
                self.log_test(f"4.{10+i} Test Frequency {frequency}", False, str(e))

        # Test autopay checkbox functionality
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "Autopay Test Bill",
                "amount": 50.0,
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                "autopay": True
            }
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            if response.status_code == 200:
                bill = response.json()
                bill_id = bill.get("id")
                self.created_bills.append(bill_id)
                success = bill.get("autopay") == True
            else:
                success = False
            
            self.log_test("4.13 Test Autopay Functionality", success,
                        f"Status: {response.status_code}, Autopay: {bill.get('autopay') if response.status_code == 200 else 'N/A'}")
        except Exception as e:
            self.log_test("4.13 Test Autopay Functionality", False, str(e))

        return True

    def test_5_data_persistence(self):
        """Test 5: Data Persistence"""
        print("\n💾 Test 5: Data Persistence")
        print("-" * 40)
        
        # Create a bill for persistence testing
        persistence_bill_data = {
            "user_id": self.user_id,
            "name": "Persistence Test Bill",
            "amount": 200.0,
            "due_date": (datetime.now() + timedelta(days=14)).strftime("%Y-%m-%d"),
            "recurring": True,
            "autopay": False,
            "frequency": "Monthly"
        }
        
        try:
            response = requests.post(f"{self.api_url}/bills", json=persistence_bill_data)
            if response.status_code == 200:
                bill = response.json()
                persistence_bill_id = bill.get("id")
                self.created_bills.append(persistence_bill_id)
                
                # Verify bill exists immediately after creation
                get_response = requests.get(f"{self.api_url}/bills/{self.user_id}")
                if get_response.status_code == 200:
                    bills = get_response.json()
                    found_bill = next((b for b in bills if b.get("id") == persistence_bill_id), None)
                    success = found_bill is not None
                    self.log_test("5.1 Bill Persists After Creation", success,
                                f"Bill found: {found_bill is not None}")
                else:
                    self.log_test("5.1 Bill Persists After Creation", False,
                                f"Get bills failed: {get_response.status_code}")
                    return False
            else:
                self.log_test("5.1 Bill Persists After Creation", False,
                            f"Create bill failed: {response.status_code}")
                return False
        except Exception as e:
            self.log_test("5.1 Bill Persists After Creation", False, str(e))
            return False

        # Mark as paid and verify persistence
        try:
            pay_response = requests.patch(f"{self.api_url}/bills/{persistence_bill_id}/pay")
            if pay_response.status_code == 200:
                # Verify it's marked as paid
                get_response = requests.get(f"{self.api_url}/bills/{self.user_id}")
                if get_response.status_code == 200:
                    bills = get_response.json()
                    found_bill = next((b for b in bills if b.get("id") == persistence_bill_id), None)
                    success = found_bill and found_bill.get("paid") == True
                    self.log_test("5.2 Paid Status Persists", success,
                                f"Bill paid status: {found_bill.get('paid') if found_bill else 'Not found'}")
                else:
                    self.log_test("5.2 Paid Status Persists", False,
                                f"Get bills failed: {get_response.status_code}")
            else:
                self.log_test("5.2 Paid Status Persists", False,
                            f"Pay bill failed: {pay_response.status_code}")
        except Exception as e:
            self.log_test("5.2 Paid Status Persists", False, str(e))

        return True

    def test_api_endpoints_individually(self):
        """Test individual API endpoints as specified in the review request"""
        print("\n🔗 API Endpoints Individual Testing")
        print("-" * 40)
        
        # Test POST /api/bills (create)
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "API Test Bill",
                "amount": 75.50,
                "due_date": (datetime.now() + timedelta(days=10)).strftime("%Y-%m-%d")
            }
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            success = response.status_code == 200
            if success:
                bill = response.json()
                api_test_bill_id = bill.get("id")
                self.created_bills.append(api_test_bill_id)
            self.log_test("API: POST /api/bills", success, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("API: POST /api/bills", False, str(e))

        # Test GET /api/bills/{user_id} (read)
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            success = response.status_code == 200
            if success:
                bills = response.json()
                success = isinstance(bills, list)
            self.log_test("API: GET /api/bills/{user_id}", success, 
                        f"Status: {response.status_code}, Type: {type(bills) if 'bills' in locals() else 'N/A'}")
        except Exception as e:
            self.log_test("API: GET /api/bills/{user_id}", False, str(e))

        # Test PUT /api/bills/{bill_id} (update) - Note: API uses PATCH, not PUT
        if hasattr(self, 'api_test_bill_id') and api_test_bill_id:
            try:
                update_data = {
                    "user_id": self.user_id,
                    "name": "Updated API Test Bill",
                    "amount": 85.75,
                    "due_date": (datetime.now() + timedelta(days=12)).strftime("%Y-%m-%d")
                }
                response = requests.patch(f"{self.api_url}/bills/{api_test_bill_id}", json=update_data)
                success = response.status_code == 200
                self.log_test("API: PATCH /api/bills/{bill_id}", success, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("API: PATCH /api/bills/{bill_id}", False, str(e))

        # Test DELETE /api/bills/{bill_id} (delete)
        if hasattr(self, 'api_test_bill_id') and api_test_bill_id:
            try:
                response = requests.delete(f"{self.api_url}/bills/{api_test_bill_id}")
                success = response.status_code == 200
                if success:
                    self.created_bills.remove(api_test_bill_id)
                self.log_test("API: DELETE /api/bills/{bill_id}", success, f"Status: {response.status_code}")
            except Exception as e:
                self.log_test("API: DELETE /api/bills/{bill_id}", False, str(e))

        # Test PATCH /api/bills/{bill_id} (mark as paid) - Create a new bill for this test
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "Pay Test Bill",
                "amount": 55.00,
                "due_date": (datetime.now() + timedelta(days=5)).strftime("%Y-%m-%d")
            }
            create_response = requests.post(f"{self.api_url}/bills", json=bill_data)
            if create_response.status_code == 200:
                bill = create_response.json()
                pay_test_bill_id = bill.get("id")
                self.created_bills.append(pay_test_bill_id)
                
                # Now test the pay endpoint
                pay_response = requests.patch(f"{self.api_url}/bills/{pay_test_bill_id}/pay")
                success = pay_response.status_code == 200
                self.log_test("API: PATCH /api/bills/{bill_id}/pay", success, 
                            f"Status: {pay_response.status_code}")
            else:
                self.log_test("API: PATCH /api/bills/{bill_id}/pay", False, 
                            f"Failed to create test bill: {create_response.status_code}")
        except Exception as e:
            self.log_test("API: PATCH /api/bills/{bill_id}/pay", False, str(e))

        return True

    def run_comprehensive_tests(self):
        """Run all comprehensive tests"""
        print("🧪 Starting Comprehensive Bills & Payments Feature Testing")
        print("=" * 60)
        print(f"🎯 Testing User ID: {self.user_id}")
        print(f"🌐 API Base URL: {self.api_url}")
        print("=" * 60)
        
        try:
            # Run all test suites
            self.test_1_full_crud_cycle()
            self.test_2_validation_testing()
            self.test_3_empty_state_scenarios()
            self.test_4_edge_cases()
            self.test_5_data_persistence()
            self.test_api_endpoints_individually()
            
        finally:
            # Clean up created bills
            print(f"\n🧹 Cleaning up {len(self.created_bills)} test bills...")
            self.cleanup_bills()

        # Print comprehensive summary
        print("\n" + "=" * 60)
        print("📊 COMPREHENSIVE TEST RESULTS")
        print("=" * 60)
        print(f"📈 Tests Run: {self.tests_run}")
        print(f"✅ Tests Passed: {self.tests_passed}")
        print(f"❌ Tests Failed: {self.tests_run - self.tests_passed}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📊 Success Rate: {success_rate:.1f}%")
        
        # Detailed failure analysis
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
            print("-" * 40)
            for test in failed_tests:
                print(f"• {test['name']}: {test['details']}")
        
        # Success criteria
        if success_rate >= 90:
            print("\n🎉 EXCELLENT: Bills & Payments feature is production-ready!")
            return True
        elif success_rate >= 80:
            print("\n✅ GOOD: Bills & Payments feature is mostly working with minor issues")
            return True
        elif success_rate >= 70:
            print("\n⚠️  ACCEPTABLE: Bills & Payments feature has some issues that should be addressed")
            return False
        else:
            print("\n❌ CRITICAL: Bills & Payments feature has significant issues requiring immediate attention")
            return False

def main():
    """Main function to run the comprehensive tests"""
    tester = BillsPaymentsComprehensiveTester()
    success = tester.run_comprehensive_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())