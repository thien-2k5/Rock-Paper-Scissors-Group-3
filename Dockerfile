FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080
EXPOSE 3000

CMD sh -c "python3 server/server.py & cd client && python3 -m http.server 3000"