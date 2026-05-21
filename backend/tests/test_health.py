import asyncio
from unittest.mock import AsyncMock, MagicMock, patch


def _make_mock_engine():
    mock_conn = AsyncMock()
    mock_ctx = MagicMock()
    mock_ctx.__aenter__ = AsyncMock(return_value=mock_conn)
    mock_ctx.__aexit__ = AsyncMock(return_value=False)
    mock_engine = MagicMock()
    mock_engine.begin.return_value = mock_ctx
    return mock_engine


def test_health_returns_ok():
    with patch("app.main.engine", _make_mock_engine()):
        import app.main as main_module
        result = asyncio.run(main_module.health())
    assert result == {"status": "ok"}


def test_health_returns_dict():
    with patch("app.main.engine", _make_mock_engine()):
        import app.main as main_module
        result = asyncio.run(main_module.health())
    assert isinstance(result, dict)
    assert "status" in result
