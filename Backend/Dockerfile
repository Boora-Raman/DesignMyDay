# Use Maven + JDK image as build stage 
FROM maven:3.9.6-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /build
 
# Copy all project files into the container
COPY . .

# Build the application using Maven
RUN mvn clean package -DskipTests

# Use a smaller image for running the app
FROM eclipse-temurin:17-jdk-alpine

# Set working directory for runtime
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=builder /build/target/DesignMyDay-0.0.1-SNAPSHOT.jar app.jar

# Expose application port
EXPOSE 8085

# Run the JAR
ENTRYPOINT ["java", "-jar", "app.jar"]
