
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey,
    CheckConstraint,
    func
)

from app.database import Base


class Claim(Base):
    __tablename__ = "claims"

    __table_args__ = (
        CheckConstraint(
            "requested_quantity > 0",
            name="check_requested_quantity_positive"
        ),
    )

    id = Column(Integer, primary_key=True, index=True)

    donation_id = Column(
        Integer,
        ForeignKey("donations.id"),
        nullable=False
    )

    ngo_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    requested_quantity = Column(Integer, nullable=False)

    status = Column(
        String(30),
        default="CONFIRMED",
        nullable=False
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
