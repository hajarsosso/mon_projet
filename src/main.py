def addition(a, b):
    return a + b

def soustraction(a, b):
    return a - b

def multiplication(a, b):
    return a * b

def division(a, b):
    if b != 0:
        return a / b
    return "Error: Division by zero"

if __name__ == "__main__":
    print("Welcome to Calculator!")
    print(f"2 + 3 = {addition(2, 3)}")
