"""
Logging utilities for Phase 2 autonomous agents.
"""

import logging
from datetime import datetime
from typing import Optional


def get_logger(name: str, level: str = "INFO") -> logging.Logger:
    """
    Get a configured logger for an agent.

    Args:
        name: Logger name (typically agent type)
        level: Log level (DEBUG, INFO, WARNING, ERROR)

    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            '[%(asctime)s] [%(name)s] [%(levelname)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    logger.setLevel(getattr(logging, level.upper()))

    return logger
