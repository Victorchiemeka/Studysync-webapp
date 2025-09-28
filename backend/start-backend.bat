@echo off
echo ==================================
echo    StudySync Backend Startup
echo ==================================

echo 📋 Checking Java version...
java -version

echo.
echo 📋 Checking Maven version...
call mvn -version

echo.
echo 🗃️ Creating data directory...
if not exist "data" mkdir data

echo.
echo 🧹 Cleaning previous build...
call mvn clean

echo.
echo 📦 Compiling application...
call mvn compile

echo.
echo 🚀 Starting StudySync Backend...
echo    - Backend URL: http://localhost:8081
echo    - H2 Console: http://localhost:8081/h2-console
echo    - API Docs: http://localhost:8081/api
echo.
echo Press Ctrl+C to stop the server
echo.

call mvn spring-boot:run