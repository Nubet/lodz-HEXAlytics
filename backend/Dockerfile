FROM eclipse-temurin:24-jdk AS builder
WORKDIR /app

COPY gradlew build.gradle settings.gradle ./
COPY gradle gradle
COPY src src

RUN chmod +x gradlew && ./gradlew bootJar --no-daemon

FROM eclipse-temurin:24-jre
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
