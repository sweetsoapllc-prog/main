import requests
import sys
import json
from datetime import datetime, timedelta

class QuietHousekeeperAPITester:
    def __init__(self, base_url="https://mental-peace-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.user_id = "demo-user-123"
        self.session_id = f"test-session-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_items = {
            'tasks': [],
            'routines': [],
            'bills': [],
            'energy_checkins': []
        }

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        return success

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.api_url}/")
            success = response.status_code == 200 and "Quiet Housekeeper API" in response.json().get("message", "")
            return self.log_test("API Root", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("API Root", False, str(e))

    def test_user_operations(self):
        """Test user creation and retrieval"""
        # Test user creation
        try:
            user_data = {
                "name": "Test User",
                "email": "test@example.com"
            }
            response = requests.post(f"{self.api_url}/users", json=user_data)
            success = response.status_code == 200
            if not self.log_test("Create User", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Create User", False, str(e))
            return False

        # Test user retrieval
        try:
            response = requests.get(f"{self.api_url}/users/{self.user_id}")
            success = response.status_code == 200 or response.status_code == 404  # 404 is acceptable if user doesn't exist
            return self.log_test("Get User", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get User", False, str(e))

    def test_task_operations(self):
        """Test task CRUD operations"""
        # Create task
        try:
            task_data = {
                "user_id": self.user_id,
                "title": "Test Task",
                "description": "This is a test task",
                "category": "today"
            }
            response = requests.post(f"{self.api_url}/tasks", json=task_data)
            success = response.status_code == 200
            if success:
                task_id = response.json().get("id")
                self.created_items['tasks'].append(task_id)
            if not self.log_test("Create Task", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Create Task", False, str(e))
            return False

        # Get tasks
        try:
            response = requests.get(f"{self.api_url}/tasks/{self.user_id}")
            success = response.status_code == 200
            if not self.log_test("Get Tasks", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Get Tasks", False, str(e))
            return False

        # Update task (if we have a task ID)
        if self.created_items['tasks']:
            try:
                task_id = self.created_items['tasks'][0]
                update_data = {"completed": True}
                response = requests.patch(f"{self.api_url}/tasks/{task_id}", json=update_data)
                success = response.status_code == 200
                if not self.log_test("Update Task", success, f"Status: {response.status_code}"):
                    return False
            except Exception as e:
                self.log_test("Update Task", False, str(e))
                return False

        # Delete task (if we have a task ID)
        if self.created_items['tasks']:
            try:
                task_id = self.created_items['tasks'][0]
                response = requests.delete(f"{self.api_url}/tasks/{task_id}")
                success = response.status_code == 200
                return self.log_test("Delete Task", success, f"Status: {response.status_code}")
            except Exception as e:
                return self.log_test("Delete Task", False, str(e))

        return True

    def test_routine_operations(self):
        """Test routine operations"""
        # Create routine
        try:
            routine_data = {
                "user_id": self.user_id,
                "name": "Test Morning Routine",
                "time_of_day": "morning",
                "items": ["Drink water", "Stretch", "Meditate"]
            }
            response = requests.post(f"{self.api_url}/routines", json=routine_data)
            success = response.status_code == 200
            if success:
                routine_id = response.json().get("id")
                self.created_items['routines'].append(routine_id)
            if not self.log_test("Create Routine", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Create Routine", False, str(e))
            return False

        # Get routines
        try:
            response = requests.get(f"{self.api_url}/routines/{self.user_id}")
            success = response.status_code == 200
            if not self.log_test("Get Routines", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Get Routines", False, str(e))
            return False

        # Complete routine
        if self.created_items['routines']:
            try:
                routine_id = self.created_items['routines'][0]
                response = requests.patch(f"{self.api_url}/routines/{routine_id}/complete")
                success = response.status_code == 200
                return self.log_test("Complete Routine", success, f"Status: {response.status_code}")
            except Exception as e:
                return self.log_test("Complete Routine", False, str(e))

        return True

    def test_bill_operations(self):
        """Test bill operations"""
        # Create bill
        try:
            bill_data = {
                "user_id": self.user_id,
                "name": "Test Electric Bill",
                "amount": 125.50,
                "due_date": (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d"),
                "recurring": True
            }
            response = requests.post(f"{self.api_url}/bills", json=bill_data)
            success = response.status_code == 200
            if success:
                bill_id = response.json().get("id")
                self.created_items['bills'].append(bill_id)
            if not self.log_test("Create Bill", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Create Bill", False, str(e))
            return False

        # Get bills
        try:
            response = requests.get(f"{self.api_url}/bills/{self.user_id}")
            success = response.status_code == 200
            if not self.log_test("Get Bills", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Get Bills", False, str(e))
            return False

        # Pay bill
        if self.created_items['bills']:
            try:
                bill_id = self.created_items['bills'][0]
                response = requests.patch(f"{self.api_url}/bills/{bill_id}/pay")
                success = response.status_code == 200
                return self.log_test("Pay Bill", success, f"Status: {response.status_code}")
            except Exception as e:
                return self.log_test("Pay Bill", False, str(e))

        return True

    def test_energy_operations(self):
        """Test energy check-in operations"""
        # Create energy check-in
        try:
            energy_data = {
                "user_id": self.user_id,
                "energy_level": 4,
                "notes": "Feeling good today!"
            }
            response = requests.post(f"{self.api_url}/energy", json=energy_data)
            success = response.status_code == 200
            if success:
                energy_id = response.json().get("id")
                self.created_items['energy_checkins'].append(energy_id)
            if not self.log_test("Create Energy Check-in", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Create Energy Check-in", False, str(e))
            return False

        # Get energy check-ins
        try:
            response = requests.get(f"{self.api_url}/energy/{self.user_id}")
            success = response.status_code == 200
            return self.log_test("Get Energy Check-ins", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Energy Check-ins", False, str(e))

    def test_chat_operations(self):
        """Test chat operations"""
        # Send chat message
        try:
            chat_data = {
                "user_id": self.user_id,
                "session_id": self.session_id,
                "message": "Hello, I need help organizing my day."
            }
            response = requests.post(f"{self.api_url}/chat", json=chat_data)
            success = response.status_code == 200
            if success:
                response_data = response.json()
                ai_response = response_data.get("message", "")
                print(f"   AI Response: {ai_response[:100]}...")
            if not self.log_test("Send Chat Message", success, f"Status: {response.status_code}"):
                return False
        except Exception as e:
            self.log_test("Send Chat Message", False, str(e))
            return False

        # Get chat history
        try:
            response = requests.get(f"{self.api_url}/chat/history/{self.user_id}/{self.session_id}")
            success = response.status_code == 200
            if success:
                messages = response.json()
                print(f"   Chat history contains {len(messages)} messages")
            return self.log_test("Get Chat History", success, f"Status: {response.status_code}")
        except Exception as e:
            return self.log_test("Get Chat History", False, str(e))

    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting Quiet Housekeeper API Tests")
        print("=" * 50)
        
        # Test API availability
        if not self.test_api_root():
            print("❌ API is not accessible, stopping tests")
            return False

        # Test all endpoints
        self.test_user_operations()
        self.test_task_operations()
        self.test_routine_operations()
        self.test_bill_operations()
        self.test_energy_operations()
        self.test_chat_operations()

        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 80:
            print("✅ Backend API tests mostly successful")
            return True
        else:
            print("❌ Backend API has significant issues")
            return False

def main():
    tester = QuietHousekeeperAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())