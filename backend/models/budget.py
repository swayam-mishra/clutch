import uuid
from datetime import date
from sqlalchemy import String, Date, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db.base_class import Base

class Budget(Base):
    __tablename__ = "budgets"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"), index=True)
    
    # The month this budget applies to (always store as 1st of month)
    month: Mapped[date] = mapped_column(Date, nullable=False)
    
    # Income & Targets
    total_income: Mapped[float] = mapped_column(Float, default=0.0)
    savings_goal_percent: Mapped[float] = mapped_column(Float, default=0.20) # Default 20%
    
    # Relationships (We will define User and WeeklySnapshot later)
    user = relationship("User", back_populates="budgets")

    @property
    def spending_limit(self) -> float:
        """
        Pure function: Calculates the hard cap for spending.
        Income - Savings = Spendable
        """
        return self.total_income * (1.0 - self.savings_goal_percent)

    def __repr__(self):
        return f"<Budget month={self.month} income={self.total_income}>"