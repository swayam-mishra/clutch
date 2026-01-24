import sys
import os
from datetime import date

# Add the parent directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.finance import calculate_daily_safe_spend

def run_utkarsh_simulation():
    print("--- 🧪 Running Simulation: 'Utkarsh the Impulse Spender' ---\n")

    # 1. Setup Utkarsh's Profile (The Constraints)
    # Income: $2000 | Rent+Bills: $900 | Savings Goal: 10%
    income = 2000.00
    savings_percent = 0.10
    fixed_bills = 900.00  # Rent ($800) + Utilities ($100)
    
    # 2. Simulation Date: It is the 15th of the month
    current_date = date(2023, 10, 15)
    
    # 3. Utkarsh's "Bad Behavior" Spending History (First 15 days)
    # These are discretionary spends (Food, Uber, Shopping)
    expenses = [
        6.50, 6.50, 18.00,  # Coffee, Coffee, Uber
        45.00, 6.50, 120.00, # Dinner, Coffee, Shopping (Impulse buy!)
        60.00, 22.00, 15.00, # Dinner, Uber, Subscription
        8.00, 12.00, 55.00   # Snacks, Lunch, Bar Tab
    ]
    
    total_variable_spent = sum(expenses)

    print(f"📅 Current Date: {current_date} (Day 15)")
    print(f"💰 Income: ${income}")
    print(f"🏠 Fixed Bills: ${fixed_bills}")
    print(f"💸 Discretionary Spent so far: ${total_variable_spent} (on coffee, uber, etc.)")
    print("-" * 40)

    # 4. Run the Clutch Logic
    result = calculate_daily_safe_spend(
        income=income,
        savings_percent=savings_percent,
        fixed_expenses=fixed_bills,
        variable_spent_so_far=total_variable_spent,
        current_date=current_date
    )

    # 5. Display the Verdict
    print(f"\n🤖 CLUTCH DIAGNOSIS:")
    print(f"   Status: {result['status'].upper()} {'🔴' if result['status'] != 'healthy' else '🟢'}")
    print(f"   Daily Safe Spend: ${result['daily_safe_spend']} / day")
    print(f"   Remaining for Month: ${result['total_remaining_for_month']}")
    
    print("\n📊 WHY?")
    breakdown = result['math_breakdown']
    print(f"   Total Income:       ${breakdown['income']}")
    print(f"   - Savings (10%):    ${breakdown['savings_reserved']}")
    print(f"   - Fixed Bills:      ${breakdown['fixed_bills']}")
    print(f"   - Already Spent:    ${breakdown['already_spent']}")
    print(f"   ---------------------------")
    print(f"   = Left for 16 days: ${result['total_remaining_for_month']}")

if __name__ == "__main__":
    run_utkarsh_simulation()