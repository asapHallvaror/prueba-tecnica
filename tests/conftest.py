import pytest
from fastapi.testclient import TestClient
from app.main import app
import sys, os


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
