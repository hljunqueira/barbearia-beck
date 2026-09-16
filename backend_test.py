#!/usr/bin/env python3
"""
Testes de Integridade da API — Beck Barbearia
Valida todos os endpoints REST conectados ao Supabase PostgreSQL
"""

import os
import requests
import json
import sys
from typing import Dict, Any, List

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")

def print_test_header(test_name: str):
    print(f"\n{'='*80}")
    print(f"TESTE: {test_name}")
    print(f"{'='*80}")

def print_success(message: str):
    print(f"✅ PASS: {message}")

def print_failure(message: str):
    print(f"❌ FAIL: {message}")

def test_health_check() -> bool:
    print_test_header("Health Check da API (/api e /api/health)")
    try:
        res = requests.get(f"{BASE_URL}/api", timeout=10)
        if res.status_code != 200:
            print_failure(f"Status code esperado 200, recebido {res.status_code}")
            return False
        data = res.json()
        if not data.get("ok") or data.get("database") != "connected":
            print_failure(f"Resposta inesperada do banco: {data}")
            return False
        print_success(f"API ativa e conectada ao Supabase PostgreSQL: {data}")
        return True
    except Exception as e:
        print_failure(f"Erro ao conectar na API: {e}")
        return False

def test_plans_endpoint() -> bool:
    print_test_header("Planos do Clube da Barba (/api/plans)")
    try:
        res = requests.get(f"{BASE_URL}/api/plans", timeout=10)
        if res.status_code != 200:
            print_failure(f"Status code esperado 200, recebido {res.status_code}")
            return False
        data = res.json()
        plans = data.get("data", [])
        if len(plans) < 3:
            print_failure(f"Esperado pelo menos 3 planos, recebido {len(plans)}")
            return False
        print_success(f"{len(plans)} planos retornados com sucesso do Supabase PostgreSQL")
        return True
    except Exception as e:
        print_failure(f"Erro: {e}")
        return False

def test_products_endpoint() -> bool:
    print_test_header("Catálogo de Produtos (/api/products)")
    try:
        res = requests.get(f"{BASE_URL}/api/products", timeout=10)
        if res.status_code != 200:
            print_failure(f"Status code esperado 200, recebido {res.status_code}")
            return False
        data = res.json()
        products = data.get("data", [])
        if len(products) < 6:
            print_failure(f"Esperado pelo menos 6 produtos, recebido {len(products)}")
            return False
        print_success(f"{len(products)} produtos retornados com sucesso do Supabase PostgreSQL")
        return True
    except Exception as e:
        print_failure(f"Erro: {e}")
        return False

def test_services_endpoint() -> bool:
    print_test_header("Catálogo de Serviços (/api/services)")
    try:
        res = requests.get(f"{BASE_URL}/api/services", timeout=10)
        if res.status_code != 200:
            print_failure(f"Status code esperado 200, recebido {res.status_code}")
            return False
        data = res.json()
        services = data.get("data", [])
        if len(services) < 5:
            print_failure(f"Esperado pelo menos 5 serviços, recebido {len(services)}")
            return False
        print_success(f"{len(services)} serviços retornados com sucesso do Supabase PostgreSQL")
        return True
    except Exception as e:
        print_failure(f"Erro: {e}")
        return False

def main():
    print(f"\n💈 Iniciando testes na URL: {BASE_URL}")
    results = [
        test_health_check(),
        test_plans_endpoint(),
        test_products_endpoint(),
        test_services_endpoint(),
    ]
    if all(results):
        print("\n🎉 TODOS OS TESTES PASSARAM COM SUCESSO!")
        sys.exit(0)
    else:
        print("\n⚠️ ALGUNS TESTES FALHARAM.")
        sys.exit(1)

if __name__ == "__main__":
    main()
