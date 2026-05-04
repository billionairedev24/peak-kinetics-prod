# syntax=docker/dockerfile:1.7

FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src/backend

COPY backend/pom.xml ./pom.xml
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q dependency:go-offline -DskipTests

COPY backend/src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine

RUN apk add --no-cache curl && \
    addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser && \
    mkdir -p /app/uploads && \
    chown -R appuser:appuser /app

WORKDIR /app
COPY --from=build --chown=appuser:appuser /src/backend/target/peak-backend.jar app.jar

ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE=prod
ENV STORAGE_UPLOAD_DIR=/app/uploads

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD curl -fsS http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java","-jar","app.jar"]
