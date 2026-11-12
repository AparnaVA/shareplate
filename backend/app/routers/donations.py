
import logging
from datetime import datetime, timezone
from sqlalchemy import and_
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.claim import Claim
from app.schemas.claim import ClaimCreate, ClaimResponse
from app.dependencies.auth import get_db, get_current_user
from app.models.user import User
from app.models.donation import Donation
from app.schemas.donation import DonationCreate, DonationResponse


logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/donations",
    tags=["Donations"]
)


@router.post(
    "",
    response_model=DonationResponse,
    status_code=status.HTTP_201_CREATED
)
def create_donation(
    donation_data: DonationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Only donors can create donations
    if current_user.role != "DONOR":
        raise HTTPException(
            status_code=403,
            detail="Only donors can create donations"
        )

    # Check expiry time
    if donation_data.expiry_time.tzinfo is None:
        raise HTTPException(
            status_code=400,
            detail="Expiry time must include a timezone"
        )

    if donation_data.expiry_time <= datetime.now(timezone.utc):
        raise HTTPException(
            status_code=400,
            detail="Expiry time must be in the future"
        )

    new_donation = Donation(
        food_name=donation_data.food_name,
        description=donation_data.description,
        quantity=donation_data.quantity,
        available_quantity=donation_data.quantity,
        unit=donation_data.unit,
        pickup_location=donation_data.pickup_location,
        expiry_time=donation_data.expiry_time,
        status="AVAILABLE",
        donor_id=current_user.id
    )

    try:
        db.add(new_donation)
        db.commit()
        db.refresh(new_donation)

        logger.info(
            "Donation created: donation_id=%s donor_id=%s",
            new_donation.id,
            current_user.id
        )

        return new_donation

    except Exception:
        db.rollback()

        logger.exception("Donation creation failed")

        raise HTTPException(
            status_code=500,
            detail="Unable to create donation"
        )

@router.get(
    "",
    response_model=list[DonationResponse]
)
def get_donations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role == "DONOR":
        donations = (
            db.query(Donation)
            .filter(Donation.donor_id == current_user.id)
            .order_by(Donation.created_at.desc())
            .all()
        )

    else:
        donations = (
            db.query(Donation)
            .filter(
                and_(
                    Donation.status == "AVAILABLE",
                    Donation.available_quantity > 0,
                    Donation.expiry_time > datetime.now(timezone.utc)
                )
            )
            .order_by(Donation.expiry_time.asc())
            .all()
        )

    logger.info(
        "Donations retrieved: user_id=%s role=%s count=%s",
        current_user.id,
        current_user.role,
        len(donations)
    )

    return donations

@router.post(
    "/{donation_id}/claim",
    response_model=ClaimResponse,
    status_code=status.HTTP_201_CREATED
)
def claim_donation(
    donation_id: int,
    claim_data: ClaimCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only NGOs can claim donations
    if current_user.role != "NGO":
        logger.warning(
            "Unauthorized claim attempt: user_id=%s role=%s",
            current_user.id,
            current_user.role
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only NGOs can claim donations"
        )

    try:
        # Lock the donation row while processing the claim
        donation = (
            db.query(Donation)
            .filter(Donation.id == donation_id)
            .with_for_update()
            .first()
        )

        # Check whether donation exists
        if donation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Donation not found"
            )

        # Check whether the donation has expired
        if donation.expiry_time <= datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This donation has expired"
            )

        # Check whether food is still available
        if donation.status != "AVAILABLE" or donation.available_quantity <= 0:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This donation is no longer available"
            )

        # Check requested quantity
        if claim_data.requested_quantity > donation.available_quantity:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Requested quantity is greater than available quantity"
            )

        # Reduce available quantity
        donation.available_quantity -= claim_data.requested_quantity

        # Update status if all food has been claimed
        if donation.available_quantity == 0:
            donation.status = "FULLY_CLAIMED"

        # Create the claim record
        new_claim = Claim(
            donation_id=donation.id,
            ngo_id=current_user.id,
            requested_quantity=claim_data.requested_quantity,
            status="CONFIRMED"
        )

        db.add(new_claim)
        db.commit()
        db.refresh(new_claim)

        logger.info(
            "Donation claimed: donation_id=%s ngo_id=%s quantity=%s",
            donation.id,
            current_user.id,
            claim_data.requested_quantity
        )

        return new_claim

    except HTTPException:
        db.rollback()
        raise

    except Exception:
        db.rollback()

        logger.exception(
            "Donation claim failed: donation_id=%s",
            donation_id
        )

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to claim donation"
        )