
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict


class DonationCreate(BaseModel):
    food_name: str = Field(min_length=2, max_length=150)

    description: str | None = None

    quantity: int = Field(gt=0)

    unit: str = Field(min_length=1, max_length=30)

    pickup_location: str = Field(min_length=2, max_length=255)

    expiry_time: datetime


class DonationResponse(BaseModel):
    id: int
    food_name: str
    description: str | None
    quantity: int
    available_quantity: int
    unit: str
    pickup_location: str
    expiry_time: datetime
    status: str
    donor_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
