# ./backend/Dockerfile

# Stage 1: Build the application using Maven
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# List the target contents for easier debugging in CI logs
RUN ls -l /app/target || true

# Stage 2: Create the final, smaller image
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
# Copy whichever jar Maven produced (artifact name/version can vary). Copy as app.jar for consistency.
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]