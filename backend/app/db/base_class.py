from typing import Any
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import func
from datetime import datetime

class Base(DeclarativeBase):
    id: any
    __name__: str

    # Generate __tablename__ automatically from class name (e.g., User -> user)
    @property
    def __tablename__(cls) -> str:
        return cls.__name__.lower()

    # Every table gets a created_at timestamp automatically
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())