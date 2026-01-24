from datetime import date
import calendar

def get_days_remaining(current_date: date) -> int:
    """
    Returns the number of days left in the current month, including today.
    Always returns at least 1 to avoid division by zero.
    """
    # monthrange returns (weekday of first day, number of days in month)
    _, days_in_month = calendar.monthrange(current_date.year, current_date.month)
    days_remaining = days_in_month - current_date.day + 1
    return max(1, days_remaining)

def calculate_daily_safe_spend(
    income: float,
    savings_percent: float,
    fixed_expenses: float,
    variable_spent_so_far: float,
    current_date: date
) -> dict:
    """
    The Core Clutch Metric:
    Calculates how much a user can spend TODAY without breaking their budget.
    """
    
    # 1. Protect the Savings First
    savings_amount = income * savings_percent
    
    # 2. Calculate "True" Budget (Income - Savings)
    spendable_budget = income - savings_amount
    
    # 3. Subtract Commitments (Rent, Bills)
    # This leaves us with "Discretionary Money" (Food, Fun, Uber)
    discretionary_budget = spendable_budget - fixed_expenses
    
    # 4. Subtract what they have already spent on fun stuff
    remaining_discretionary = discretionary_budget - variable_spent_so_far
    
    # 5. Calculate Daily Safe Spend (DSS)
    days_left = get_days_remaining(current_date)
    dss = remaining_discretionary / days_left
    
    # 6. Determine Health Status
    # If DSS is negative, they are already in debt for the month
    status = "healthy"
    if remaining_discretionary < 0:
        status = "critical"
        dss = 0.0 # You can't spend negative money
    elif dss < 10.0: # Arbitrary "Student Danger Zone" threshold ($10/day is tight)
        status = "warning"

    return {
        "daily_safe_spend": round(dss, 2),
        "days_remaining": days_left,
        "total_remaining_for_month": round(remaining_discretionary, 2),
        "status": status,
        "math_breakdown": {
            "income": income,
            "savings_reserved": savings_amount,
            "fixed_bills": fixed_expenses,
            "already_spent": variable_spent_so_far
        }
    }