"""normalize trace status enum

Revision ID: 078101d3e1fe
Revises: f398e12806b9
Create Date: 2026-08-16 15:55:31.001981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '078101d3e1fe'
down_revision: Union[str, Sequence[str], None] = 'f398e12806b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Temporarily remove the enum dependency from the column
    op.execute("""
        ALTER TABLE traces
        ALTER COLUMN status TYPE VARCHAR
        USING status::text
    """)

    # Remove the old enum
    op.execute("DROP TYPE IF EXISTS tracestatus")

    # Create the correct enum
    op.execute("""
        CREATE TYPE tracestatus AS ENUM (
            'success',
            'error',
            'timeout'
        )
    """)

    # Put the column back on the new enum
    op.execute("""
        ALTER TABLE traces
        ALTER COLUMN status TYPE tracestatus
        USING status::text::tracestatus
    """)

def downgrade() -> None:
    op.execute("DROP TYPE IF EXISTS tracestatus")

    op.execute(
        "CREATE TYPE tracestatus AS ENUM ('SUCCESS', 'ERROR', 'TIMEOUT')"
    )