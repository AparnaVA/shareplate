from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ClaimCreate(BaseModel):
    requested_quantity: int = Field(gt=0)


class ClaimResponse(BaseModel):
    id: int
    donation_id: int
    ngo_id: int
    requested_quantity: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)