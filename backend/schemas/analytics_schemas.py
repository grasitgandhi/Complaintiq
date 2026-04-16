# backend/schemas/analytics_schemas.py
from pydantic import BaseModel
from typing import List


class SummaryStats(BaseModel):
    open:           int
    breach_rate:    float
    avg_resolution: float
    ai_automation:  float
    csat:           float


class VolumePoint(BaseModel):
    date:     str
    total:    int
    resolved: int


class ProductCount(BaseModel):
    product: str
    count:   int


class SLAPerformanceRow(BaseModel):
    tier:       str
    total:      int
    on_time:    int
    breached:   int
    breach_rate: float
    avg_days:   float


class SentimentRow(BaseModel):
    product:    str
    frustrated: int
    neutral:    int
    satisfied:  int


class MonthlyReportData(BaseModel):
    bank_name:    str
    period:       str
    by_category:  List[dict]
    by_channel:   List[dict]
    top_grounds:  List[dict]
    disposal:     dict
