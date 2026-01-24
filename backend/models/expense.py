import uuid
from datetime import datetime
from sqlalchemy import String, Float, ForeignKey, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db.base_class import Base

# --- 1. Category (Labels) ---
class Category(Base):
    __tablename__ = "categories"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String, unique=True, index=True) # e.g. "Food"
    is_essential: Mapped[bool] = mapped_column(Boolean, default=False) # Important for AI logic
    
    expenses = relationship("Expense", back_populates="category")

# --- 2. Expense (Transactions) ---
class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    category_id: Mapped[str] = mapped_column(ForeignKey("categories.id"))
    
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="expenses")
    category = relationship("Category", back_populates="expenses")

# --- 3. Decision Log (AI Memory) ---
class DecisionLog(Base):
    __tablename__ = "decision_logs"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    
    question: Mapped[str] = mapped_column(String) # "Can I buy these shoes?"
    ai_advice: Mapped[str] = mapped_column(String) # "No, wait until next week."
    outcome: Mapped[str] = mapped_column(String) # "yes", "no", "wait"
    
    # Snapshot of money at that exact moment
    budget_remaining_at_time: Mapped[float] = mapped_column(Float)
    
    user = relationship("User", back_populates="decision_logs")