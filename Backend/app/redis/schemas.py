from enum import Enum

# ===========================
# Redis Configuration
# ===========================

BUCKET_TTL = 60 * 60 * 24      # 24 Hours
MINUTE_BUCKET_FORMAT = "%Y%m%d%H%M"

METRICS_PREFIX = "metrics"
ALERTS_PREFIX = "alerts"


# ===========================
# Bucket Types
# ===========================

class BucketType(str, Enum):
    TOTALS = "totals"
    PROVIDER = "provider"
    MODEL = "model"
    STATUS = "status"


# ===========================
# Metric Schemas
# ===========================

COMMON_METRIC_FIELDS = (
    "requests",

    # Status Counters
    "success",
    "error",
    "timeout",

    # Latency
    "latency_sum",
    "latency_max",

    # Tokens
    "input_tokens",
    "output_tokens",
    "total_tokens",

    # Cost
    "cost",
)

TOTAL_FIELDS = COMMON_METRIC_FIELDS
PROVIDER_FIELDS = COMMON_METRIC_FIELDS
MODEL_FIELDS = COMMON_METRIC_FIELDS


# Status bucket stores only counts
STATUS_FIELDS = (
    "success",
    "error",
    "timeout",
)