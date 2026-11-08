"""add full name to users

Revision ID: 811479ba9e08
Revises: 7b435f976f3c
Create Date: 2026-11-07 19:27:44.266680

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '811479ba9e08'
down_revision: Union[str, Sequence[str], None] = '7b435f976f3c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # 1. Add full_name as nullable initially
    op.add_column(
        "users",
        sa.Column(
            "full_name",
            sa.String(length=150),
            nullable=True
        )
    )

    # 2. Backfill existing users
    op.execute("""
        UPDATE users
        SET full_name = split_part(email, '@', 1)
        WHERE full_name IS NULL
    """)

    # 3. Make full_name mandatory
    op.alter_column(
        "users",
        "full_name",
        existing_type=sa.String(length=150),
        nullable=False
    )


def downgrade() -> None:

    op.drop_column("users", "full_name")