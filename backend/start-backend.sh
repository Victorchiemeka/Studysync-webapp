#!/bin/bash

echo "=================================="
echo "   StudySync Backend Startup"
echo "=================================="

echo "📋 Checking Java version..."
java -version

echo ""
echo "📋 Checking Maven version..."
mvn -version

echo ""
echo "🗃️  Creating data directory..."
mkdir -p data

echo ""
echo "🧹 Cleaning previous build..."
mvn clean

echo ""
echo "📦 Compiling application..."
mvn compile

echo ""
echo "🚀 Starting StudySync Backend..."
echo "   - Backend URL: http://localhost:8081"
echo "   - H2 Console: http://localhost:8081/h2-console"
echo "   - API Docs: http://localhost:8081/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

mvn spring-boot:run