FROM python:3.12-slim
ARG INSTALL_AI_DEPS=0
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*
COPY requirements.txt requirements.ai.txt ./
RUN pip install --no-cache-dir -r requirements.txt &&     if [ "$INSTALL_AI_DEPS" = "1" ]; then pip install --no-cache-dir -r requirements.ai.txt; fi
COPY . .
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["python", "worker.py"]
