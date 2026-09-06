FROM python:3.11-slim

WORKDIR /app

COPY Backend/requirements.txt ./Backend/requirements.txt

RUN pip install --no-cache-dir -r Backend/requirements.txt

COPY . .

WORKDIR /app/Backend

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "6"]