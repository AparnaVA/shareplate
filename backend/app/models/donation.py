
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func
)

from app.database import Base


class Donation(Base):
    __tablename__ = "donations"

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
        CheckConstraint(
            "available_quantity >= 0",
            name="check_available_quantity_nonnegative"
        ),
        CheckConstraint(
            "available_quantity <= quantity",
            name="check_available_quantity_limit"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    food_name = Column(String(150), nullable=False)

    description = Column(Text, nullable=True)

    quantity = Column(Integer, nullable=False)

    available_quantity = Column(Integer, nullable=False)

    unit = Column(String(30), nullable=False)

    pickup_location = Column(String(255), nullable=False)

    expiry_time = Column(DateTime(timezone=True), nullable=False)

    status = Column(
        String(30),
        default="AVAILABLE",
        nullable=False
    )

    donor_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
