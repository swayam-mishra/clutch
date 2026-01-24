import uuid
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, index=True, default=lambda: str(uuid.uuid4())
    )
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[str] = mapped_column(String, nullable=True)
    
    # Financial Preferences
    currency_code: Mapped[str] = mapped_column(String, default="USD")
    
    # Relationships
    budgets = relationship("Budget", back_populates="user", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete-orphan")
    decision_logs = relationship("DecisionLog", back_populates="user") # The AI Memory

    def __repr__(self):
        return f"<User email={self.email}>"