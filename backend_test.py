#!/usr/bin/env python3
"""
Backend API Tests for Beck Barbearia
Tests all REST API endpoints and SSR functionality
"""

import requests
import json
import sys
from typing import Dict, Any, List

# Base URL from environment
BASE_URL = "https://beck-luxury-cuts.preview.emergentagent.com"

def print_test_header(test_name: str):
    """Print a formatted test header"""
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print(f"{'='*80}")

def print_success(message: str):
    """Print success message"""
    print(f"✅ PASS: {message}")

def print_failure(message: str):
    """Print failure message"""
    print(f"❌ FAIL: {message}")

def validate_uuid(value: str, field_name: str) -> bool:
    """Validate that a value is a UUID string (not ObjectId)"""
    if not isinstance(value, str):
        print_failure(f"{field_name} is not a string: {type(value)}")
        return False
    
    # UUID format: 8-4-4-4-12 hex characters
    parts = value.split('-')
    if len(parts) != 5:
        print_failure(f"{field_name} is not a valid UUID format: {value}")
        return False
    
    if len(parts[0]) != 8 or len(parts[1]) != 4 or len(parts[2]) != 4 or len(parts[3]) != 4 or len(parts[4]) != 12:
        print_failure(f"{field_name} has incorrect UUID segment lengths: {value}")
        return False
    
    print_success(f"{field_name} is a valid UUID string: {value}")
    return True

def test_health_endpoint():
    """Test 1: GET /api -> health check"""
    print_test_header("GET /api - Health Check")
    
    try:
        response = requests.get(f"{BASE_URL}/api", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_failure(f"Expected status 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        # Validate structure
        if not data.get('ok'):
            print_failure("'ok' field is not true")
            return False
        
        if data.get('service') != 'beck-barbearia':
            print_failure(f"Expected service 'beck-barbearia', got '{data.get('service')}'")
            return False
        
        database_status = data.get('database')
        if database_status not in ['connected', 'unavailable']:
            print_failure(f"Database status must be 'connected' or 'unavailable', got '{database_status}'")
            return False
        
        print(f"📊 Database Status: {database_status}")
        
        if 'timestamp' not in data:
            print_failure("Missing 'timestamp' field")
            return False
        
        # Validate ISO timestamp format
        timestamp = data.get('timestamp')
        if not isinstance(timestamp, str) or 'T' not in timestamp:
            print_failure(f"Timestamp is not in ISO format: {timestamp}")
            return False
        
        print_success("Health check endpoint working correctly")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        return False

def test_health_alias():
    """Test 2: GET /api/health -> same as /api"""
    print_test_header("GET /api/health - Health Check Alias")
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_failure(f"Expected status 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if not data.get('ok') or data.get('service') != 'beck-barbearia':
            print_failure("Health alias endpoint response invalid")
            return False
        
        print_success("Health alias endpoint working correctly")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        return False

def test_plans_endpoint():
    """Test 3: GET /api/plans -> validate plan structure"""
    print_test_header("GET /api/plans - Plans Endpoint")
    
    try:
        response = requests.get(f"{BASE_URL}/api/plans", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_failure(f"Expected status 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response structure: ok={data.get('ok')}, data length={len(data.get('data', []))}")
        
        if not data.get('ok'):
            print_failure("'ok' field is not true")
            return False
        
        plans = data.get('data', [])
        if len(plans) != 3:
            print_failure(f"Expected 3 plans, got {len(plans)}")
            return False
        
        print_success(f"Found {len(plans)} plans")
        
        # Expected plan data
        expected_plans = {
            'essencial': {'price': 8990, 'name': 'Clube Essencial'},
            'premium': {'price': 14990, 'name': 'Clube Premium', 'badge': 'Mais escolhido', 'highlighted': True},
            'black': {'price': 24990, 'name': 'Clube Black'}
        }
        
        found_slugs = set()
        
        for i, plan in enumerate(plans):
            print(f"\n--- Plan {i+1}: {plan.get('slug')} ---")
            
            # Validate UUID id
            if not validate_uuid(plan.get('id', ''), f"Plan {i+1} id"):
                return False
            
            # Validate slug
            slug = plan.get('slug')
            if slug not in ['essencial', 'premium', 'black']:
                print_failure(f"Invalid slug: {slug}")
                return False
            found_slugs.add(slug)
            
            # Validate name
            expected_name = expected_plans[slug]['name']
            if plan.get('name') != expected_name:
                print_failure(f"Expected name '{expected_name}', got '{plan.get('name')}'")
                return False
            print_success(f"Name: {plan.get('name')}")
            
            # Validate tagline
            if not isinstance(plan.get('tagline'), str) or len(plan.get('tagline', '')) == 0:
                print_failure(f"Invalid tagline for {slug}")
                return False
            print_success(f"Tagline: {plan.get('tagline')}")
            
            # Validate priceInCents
            expected_price = expected_plans[slug]['price']
            if plan.get('priceInCents') != expected_price:
                print_failure(f"Expected price {expected_price}, got {plan.get('priceInCents')}")
                return False
            print_success(f"Price: {plan.get('priceInCents')} cents")
            
            # Validate currency
            if plan.get('currency') != 'BRL':
                print_failure(f"Expected currency 'BRL', got '{plan.get('currency')}'")
                return False
            
            # Validate billingCycle
            if plan.get('billingCycle') != 'monthly':
                print_failure(f"Expected billingCycle 'monthly', got '{plan.get('billingCycle')}'")
                return False
            
            # Validate features array
            features = plan.get('features', [])
            if not isinstance(features, list) or len(features) == 0:
                print_failure(f"Features must be a non-empty array for {slug}")
                return False
            
            for j, feature in enumerate(features):
                if not isinstance(feature.get('label'), str):
                    print_failure(f"Feature {j} label must be a string")
                    return False
                if not isinstance(feature.get('included'), bool):
                    print_failure(f"Feature {j} included must be a boolean")
                    return False
            print_success(f"Features: {len(features)} items validated")
            
            # Validate highlighted
            expected_highlighted = expected_plans[slug].get('highlighted', False)
            if plan.get('highlighted') != expected_highlighted:
                print_failure(f"Expected highlighted={expected_highlighted}, got {plan.get('highlighted')}")
                return False
            
            # Validate badge
            expected_badge = expected_plans[slug].get('badge', None)
            if slug == 'premium':
                if plan.get('badge') != 'Mais escolhido':
                    print_failure(f"Premium plan should have badge 'Mais escolhido', got '{plan.get('badge')}'")
                    return False
                print_success(f"Badge: {plan.get('badge')}")
            else:
                if plan.get('badge') is not None:
                    print_failure(f"{slug} plan should have null badge, got '{plan.get('badge')}'")
                    return False
            
            # Validate karfexPlanId
            if plan.get('karfexPlanId') is not None:
                print_failure(f"karfexPlanId should be null, got {plan.get('karfexPlanId')}")
                return False
        
        if len(found_slugs) != 3:
            print_failure(f"Expected all 3 slugs, found: {found_slugs}")
            return False
        
        print_success("All plans validated successfully")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_products_endpoint():
    """Test 4: GET /api/products -> validate product structure"""
    print_test_header("GET /api/products - Products Endpoint")
    
    try:
        response = requests.get(f"{BASE_URL}/api/products", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_failure(f"Expected status 200, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response structure: ok={data.get('ok')}, data length={len(data.get('data', []))}")
        
        if not data.get('ok'):
            print_failure("'ok' field is not true")
            return False
        
        products = data.get('data', [])
        if len(products) != 6:
            print_failure(f"Expected 6 products, got {len(products)}")
            return False
        
        print_success(f"Found {len(products)} products")
        
        valid_categories = ['pomada', 'oleo', 'balm', 'kit']
        
        for i, product in enumerate(products):
            print(f"\n--- Product {i+1}: {product.get('slug')} ---")
            
            # Validate UUID id
            if not validate_uuid(product.get('id', ''), f"Product {i+1} id"):
                return False
            
            # Validate slug
            if not isinstance(product.get('slug'), str) or len(product.get('slug', '')) == 0:
                print_failure(f"Invalid slug for product {i+1}")
                return False
            print_success(f"Slug: {product.get('slug')}")
            
            # Validate name
            if not isinstance(product.get('name'), str) or len(product.get('name', '')) == 0:
                print_failure(f"Invalid name for product {i+1}")
                return False
            print_success(f"Name: {product.get('name')}")
            
            # Validate category
            category = product.get('category')
            if category not in valid_categories:
                print_failure(f"Invalid category '{category}', must be one of {valid_categories}")
                return False
            print_success(f"Category: {category}")
            
            # Validate description
            if not isinstance(product.get('description'), str) or len(product.get('description', '')) == 0:
                print_failure(f"Invalid description for product {i+1}")
                return False
            
            # Validate priceInCents
            price = product.get('priceInCents')
            if not isinstance(price, (int, float)) or price <= 0:
                print_failure(f"Invalid priceInCents: {price}")
                return False
            print_success(f"Price: {price} cents")
            
            # Validate compareAtPriceInCents (can be null or number)
            compare_price = product.get('compareAtPriceInCents')
            if compare_price is not None and not isinstance(compare_price, (int, float)):
                print_failure(f"Invalid compareAtPriceInCents: {compare_price}")
                return False
            
            # Validate imageUrl
            image_url = product.get('imageUrl', '')
            if not image_url.startswith('/images/'):
                print_failure(f"imageUrl must start with '/images/', got: {image_url}")
                return False
            if not image_url.endswith('.webp'):
                print_failure(f"imageUrl must end with '.webp', got: {image_url}")
                return False
            print_success(f"Image URL: {image_url}")
            
            # Validate inStock
            if product.get('inStock') != True:
                print_failure(f"Product {i+1} should be inStock=true")
                return False
            
            # Validate rating
            rating = product.get('rating')
            if not isinstance(rating, (int, float)) or rating < 0 or rating > 5:
                print_failure(f"Rating must be between 0 and 5, got: {rating}")
                return False
            print_success(f"Rating: {rating}")
            
            # Validate karfexProductId
            if product.get('karfexProductId') is not None:
                print_failure(f"karfexProductId should be null, got {product.get('karfexProductId')}")
                return False
        
        print_success("All products validated successfully")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_product_images():
    """Test 4b: Validate product image URLs are accessible"""
    print_test_header("Product Images - Accessibility Check")
    
    try:
        # Get products first
        response = requests.get(f"{BASE_URL}/api/products", timeout=10)
        if response.status_code != 200:
            print_failure("Could not fetch products")
            return False
        
        products = response.json().get('data', [])
        
        for product in products:
            image_url = product.get('imageUrl', '')
            full_url = f"{BASE_URL}{image_url}"
            
            print(f"\nChecking: {image_url}")
            img_response = requests.get(full_url, timeout=10)
            
            if img_response.status_code != 200:
                print_failure(f"Image not accessible: {image_url} (status {img_response.status_code})")
                return False
            
            content_type = img_response.headers.get('content-type', '')
            if 'image/webp' not in content_type and 'image' not in content_type:
                print_failure(f"Invalid content-type for {image_url}: {content_type}")
                return False
            
            print_success(f"Image accessible: {image_url} ({content_type})")
        
        print_success("All product images are accessible")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        return False

def test_404_handling():
    """Test 5: GET /api/does-not-exist -> 404"""
    print_test_header("GET /api/does-not-exist - 404 Handling")
    
    try:
        response = requests.get(f"{BASE_URL}/api/does-not-exist", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 404:
            print_failure(f"Expected status 404, got {response.status_code}")
            return False
        
        data = response.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        if data.get('ok') != False:
            print_failure("'ok' field should be false for 404")
            return False
        
        if 'error' not in data or not isinstance(data.get('error'), str):
            print_failure("Missing or invalid 'error' field")
            return False
        
        print_success(f"404 handling working correctly: {data.get('error')}")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        return False

def test_cors_options():
    """Test 6: OPTIONS /api/plans -> 204 with CORS headers"""
    print_test_header("OPTIONS /api/plans - CORS Preflight")
    
    try:
        response = requests.options(f"{BASE_URL}/api/plans", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 204:
            print_failure(f"Expected status 204, got {response.status_code}")
            return False
        
        # Check CORS headers
        headers = response.headers
        print(f"CORS Headers:")
        print(f"  Access-Control-Allow-Origin: {headers.get('Access-Control-Allow-Origin')}")
        print(f"  Access-Control-Allow-Methods: {headers.get('Access-Control-Allow-Methods')}")
        print(f"  Access-Control-Allow-Headers: {headers.get('Access-Control-Allow-Headers')}")
        
        if 'Access-Control-Allow-Origin' not in headers:
            print_failure("Missing Access-Control-Allow-Origin header")
            return False
        
        print_success("CORS preflight working correctly")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        return False

def test_ssr_homepage():
    """Test 7: GET / -> SSR check for plans and products"""
    print_test_header("GET / - SSR Homepage Check")
    
    try:
        response = requests.get(f"{BASE_URL}/", timeout=10)
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print_failure(f"Expected status 200, got {response.status_code}")
            return False
        
        html = response.text
        print(f"HTML length: {len(html)} characters")
        
        # Check for plan names
        required_texts = [
            'Clube Essencial',
            'Clube Premium',
            'Clube Black'
        ]
        
        for text in required_texts:
            if text not in html:
                print_failure(f"Missing text in HTML: '{text}'")
                return False
            print_success(f"Found: '{text}'")
        
        # Check for plan data-testid attributes
        plan_testids = [
            'data-testid="plan-card-essencial"',
            'data-testid="plan-card-premium"',
            'data-testid="plan-card-black"'
        ]
        
        for testid in plan_testids:
            if testid not in html:
                print_failure(f"Missing in HTML: {testid}")
                return False
            print_success(f"Found: {testid}")
        
        # Check for exactly 6 product cards
        product_card_count = html.count('data-testid="product-card-')
        if product_card_count != 6:
            print_failure(f"Expected 6 product cards, found {product_card_count}")
            return False
        print_success(f"Found {product_card_count} product cards")
        
        # Check for hero section
        if 'data-testid="hero-section"' not in html:
            print_failure("Missing hero section data-testid")
            return False
        print_success("Found hero section")
        
        # Check for logo
        if '/images/logo-removebg-preview.png' not in html:
            print_failure("Missing logo image path")
            return False
        print_success("Found logo image path")
        
        # Check for formatted prices (e.g., "149" and ",90")
        if '149' not in html or ',90' not in html:
            print_failure("Missing formatted price components (149 and ,90)")
            return False
        print_success("Found formatted prices")
        
        print_success("SSR homepage rendering correctly")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_static_assets():
    """Test 8: Static assets (logo and hero background)"""
    print_test_header("Static Assets - Logo and Hero Background")
    
    assets = [
        '/images/logo-removebg-preview.png',
        '/images/hero-bg.webp'
    ]
    
    try:
        for asset_path in assets:
            full_url = f"{BASE_URL}{asset_path}"
            print(f"\nChecking: {asset_path}")
            
            response = requests.get(full_url, timeout=10)
            
            if response.status_code != 200:
                print_failure(f"Asset not accessible: {asset_path} (status {response.status_code})")
                return False
            
            content_type = response.headers.get('content-type', '')
            if 'image/webp' not in content_type and 'image' not in content_type:
                print_failure(f"Invalid content-type for {asset_path}: {content_type}")
                return False
            
            print_success(f"Asset accessible: {asset_path} ({content_type}, {len(response.content)} bytes)")
        
        print_success("All static assets are accessible")
        return True
        
    except Exception as e:
        print_failure(f"Exception occurred: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print(f"\n{'#'*80}")
    print(f"# Beck Barbearia Backend API Tests")
    print(f"# Base URL: {BASE_URL}")
    print(f"{'#'*80}\n")
    
    tests = [
        ("Health Check (/api)", test_health_endpoint),
        ("Health Alias (/api/health)", test_health_alias),
        ("Plans Endpoint (/api/plans)", test_plans_endpoint),
        ("Products Endpoint (/api/products)", test_products_endpoint),
        ("Product Images", test_product_images),
        ("404 Handling", test_404_handling),
        ("CORS Preflight", test_cors_options),
        ("SSR Homepage", test_ssr_homepage),
        ("Static Assets", test_static_assets),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_failure(f"Test '{test_name}' crashed: {str(e)}")
            results.append((test_name, False))
    
    # Print summary
    print(f"\n{'='*80}")
    print("TEST SUMMARY")
    print(f"{'='*80}\n")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n{'='*80}")
    print(f"Results: {passed}/{total} tests passed")
    print(f"{'='*80}\n")
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
