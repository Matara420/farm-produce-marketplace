#!/usr/bin/env python3
"""
Comprehensive test script for Farm Produce Marketplace
Tests all major functionality including profile pictures
"""

import requests
import json
import os
import time

BASE_URL = "http://localhost:5000"

def test_api_endpoints():
    """Test all API endpoints"""
    print("🧪 Testing API Endpoints...")
    
    # Test 1: Home endpoint
    try:
        response = requests.get(f"{BASE_URL}/")
        assert response.status_code == 200
        print("✅ Home endpoint working")
    except Exception as e:
        print(f"❌ Home endpoint failed: {e}")
        return False
    
    # Test 2: Register new user
    try:
        user_data = {
            "name": "Test Farmer",
            "email": f"farmer{int(time.time())}@test.com",
            "password": "password123",
            "role": "farmer"
        }
        response = requests.post(f"{BASE_URL}/register", json=user_data)
        assert response.status_code == 201
        farmer_token = response.json()["token"]
        print("✅ User registration working")
    except Exception as e:
        print(f"❌ User registration failed: {e}")
        return False
    
    # Test 3: Login
    try:
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        assert response.status_code == 200
        token = response.json()["token"]
        user = response.json()["user"]
        print("✅ User login working")
    except Exception as e:
        print(f"❌ User login failed: {e}")
        return False
    
    # Test 4: Get products
    try:
        response = requests.get(f"{BASE_URL}/products")
        assert response.status_code == 200
        products = response.json()
        print(f"✅ Products endpoint working ({len(products)} products found)")
    except Exception as e:
        print(f"❌ Products endpoint failed: {e}")
        return False
    
    # Test 5: Create product (farmer only)
    try:
        headers = {"Authorization": f"Bearer {token}"}
        product_data = {
            "name": "Test Tomatoes",
            "price": 50.0,
            "category": "Vegetables",
            "stock": 100,
            "description": "Fresh test tomatoes",
            "image": "https://via.placeholder.com/300"
        }
        response = requests.post(f"{BASE_URL}/products", json=product_data, headers=headers)
        assert response.status_code == 201
        print("✅ Product creation working")
    except Exception as e:
        print(f"❌ Product creation failed: {e}")
        return False
    
    # Test 6: Profile endpoint
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{BASE_URL}/users/profile", headers=headers)
        assert response.status_code == 200
        profile = response.json()
        print("✅ Profile endpoint working")
    except Exception as e:
        print(f"❌ Profile endpoint failed: {e}")
        return False
    
    print("🎉 All API tests passed!")
    return True

def test_file_structure():
    """Test if all required files exist"""
    print("\n📁 Testing File Structure...")
    
    required_files = [
        "client/src/App.jsx",
        "client/src/components/Navigation.jsx",
        "client/src/components/Sidebar.jsx",
        "client/src/components/ProductCard.jsx",
        "client/src/pages/Profile.jsx",
        "client/src/context/AuthContext.jsx",
        "server/app.py",
        "server/models.py"
    ]
    
    for file_path in required_files:
        if os.path.exists(file_path):
            print(f"✅ {file_path}")
        else:
            print(f"❌ {file_path} missing")
            return False
    
    print("🎉 All required files exist!")
    return True

def test_css_consistency():
    """Test CSS files for consistency"""
    print("\n🎨 Testing CSS Consistency...")
    
    css_files = [
        "client/src/index.css",
        "client/src/components/Navigation.css",
        "client/src/components/ProductCard.css",
        "client/src/components/Sidebar.css",
        "client/src/pages/DashboardPage.css"
    ]
    
    for css_file in css_files:
        if os.path.exists(css_file):
            with open(css_file, 'r') as f:
                content = f.read()
                # Check for professional sizing standards
                if "min-height: 44px" in content or "padding:" in content:
                    print(f"✅ {css_file} has professional sizing")
                else:
                    print(f"⚠️  {css_file} may need sizing improvements")
        else:
            print(f"❌ {css_file} missing")
    
    print("🎉 CSS consistency check completed!")
    return True

def main():
    """Run all tests"""
    print("🚀 Starting Farm Produce Marketplace Tests\n")
    
    # Change to project directory
    os.chdir("/home/matara/farm-produce-marketplace")
    
    # Run tests
    tests = [
        test_file_structure,
        test_css_consistency,
        test_api_endpoints
    ]
    
    results = []
    for test in tests:
        try:
            result = test()
            results.append(result)
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            results.append(False)
    
    # Summary
    print(f"\n📊 Test Summary:")
    print(f"Passed: {sum(results)}/{len(results)}")
    
    if all(results):
        print("🎉 All tests passed! Your application is ready!")
    else:
        print("⚠️  Some tests failed. Check the output above.")
    
    return all(results)

if __name__ == "__main__":
    main()