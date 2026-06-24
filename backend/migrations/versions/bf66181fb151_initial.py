"""initial

Revision ID: bf66181fb151
Revises: 
Create Date: 2026-06-24 18:21:28.123456

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'bf66181fb151'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='Staff'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # create forecasts table
    op.create_table(
        'forecasts',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('forecasted_footfall', sa.Integer(), nullable=False),
        sa.Column('actual_footfall', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index(op.f('ix_forecasts_date'), 'forecasts', ['date'], unique=True)
    op.create_index(op.f('ix_forecasts_id'), 'forecasts', ['id'], unique=False)

    # create schedules table
    op.create_table(
        'schedules',
        sa.Column('id', sa.Integer(), nullable=False, primary_key=True),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('shift_start', sa.DateTime(), nullable=False),
        sa.Column('shift_end', sa.DateTime(), nullable=False),
        sa.Column('role', sa.String(length=100), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='Draft'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index(op.f('ix_schedules_id'), 'schedules', ['id'], unique=False)

def downgrade() -> None:
    op.drop_index(op.f('ix_schedules_id'), table_name='schedules')
    op.drop_table('schedules')
    op.drop_index(op.f('ix_forecasts_id'), table_name='forecasts')
    op.drop_index(op.f('ix_forecasts_date'), table_name='forecasts')
    op.drop_table('forecasts')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_table('users')
