from src.main import addition, soustraction, multiplication, division

def test_addition():
    assert addition(2, 3) == 5
    assert addition(-1, 1) == 0

def test_soustraction():
    assert soustraction(5, 3) == 2
    assert soustraction(10, 7) == 3

def test_multiplication():
    assert multiplication(4, 3) == 12
    assert multiplication(0, 5) == 0

def test_division():
    assert division(10, 2) == 5
    assert division(5, 0) == "Error: Division by zero"

