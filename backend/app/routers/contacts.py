"""Demo contact API."""

from fastapi import APIRouter

from app.demo_data import CONTACTS, contact_response
from app.models import ContactResponse

router = APIRouter(tags=["contacts"])


@router.get("/contacts", response_model=list[ContactResponse])
async def list_contacts() -> list[ContactResponse]:
    return [ContactResponse(**contact_response(contact)) for contact in CONTACTS]
