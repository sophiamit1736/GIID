@echo off
python -m pip install -r requirements-ml.txt
python -m uvicorn ml_service:app --host 127.0.0.1 --port 8001
