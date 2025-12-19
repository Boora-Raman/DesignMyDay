# Build Stage
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build
COPY . .
RUN mvn clean install

# Runtime Stage
FROM eclipse-temurin:17-jdk-alpine  
WORKDIR /app 
COPY --from=builder /build/target/DesignMyDay-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8085
ENTRYPOINT ["java", "-jar", "app.jar"]
