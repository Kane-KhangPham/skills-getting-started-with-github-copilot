import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)

def test_signup_for_activity():
    email = "newstudent@mergington.edu"
    activity = "Chess Club"
    # Ensure not already signed up
    client.post(f"/activities/{activity}/unregister?email={email}")
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert "Signed up" in response.json()["message"]
    # Try signing up again (should fail)
    response2 = client.post(f"/activities/{activity}/signup?email={email}")
    assert response2.status_code == 400

def test_unregister_from_activity():
    email = "newstudent@mergington.edu"
    activity = "Chess Club"
    # Ensure signed up first
    client.post(f"/activities/{activity}/signup?email={email}")
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response.status_code == 200
    assert "Removed" in response.json()["message"]
    # Try unregistering again (should fail)
    response2 = client.post(f"/activities/{activity}/unregister?email={email}")
    assert response2.status_code == 400
