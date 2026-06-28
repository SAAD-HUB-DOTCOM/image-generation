from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, timezone


class Job(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    prompt: str
    num_thumbnail: int
    headshot_url: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    thumbnails: List["Thumbnail"] = Relationship(back_populates="job")


class Thumbnail(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_id: Optional[int] = Field(default=None, foreign_key="job.id")
    style_name: str
    status: str = "pending"
    imagekit_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    job: Optional[Job] = Relationship(back_populates="thumbnails")
