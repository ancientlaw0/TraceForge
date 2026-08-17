"""add error and timeout trace statuses

Revision ID: f398e12806b9
Revises: 7745af257650
Create Date: 2026-08-16 15:36:55.818825

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f398e12806b9'
down_revision: Union[str, Sequence[str], None] = '7745af257650'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "ALTER TYPE tracestatus ADD VALUE IF NOT EXISTS 'error'"
    )
    op.execute(
        "ALTER TYPE tracestatus ADD VALUE IF NOT EXISTS 'timeout'"
    )


def downgrade() -> None:
    pass