@echo off
echo Downloading Maven Wrapper...

REM Create .mvn directory
if not exist ".mvn\wrapper" mkdir ".mvn\wrapper"

REM Download Maven Wrapper files
curl -o ".mvn\wrapper\maven-wrapper.jar" https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.8.6/maven-wrapper-3.8.6.jar
curl -o ".mvn\wrapper\maven-wrapper.properties" https://raw.githubusercontent.com/apache/maven/master/maven-wrapper/src/main/resources/META-INF/maven/wrapper.properties
curl -o "mvnw" https://raw.githubusercontent.com/apache/maven/master/mvnw
curl -o "mvnw.cmd" https://raw.githubusercontent.com/apache/maven/master/mvnw.cmd

echo Maven Wrapper downloaded successfully!
echo You can now use: mvnw.cmd spring-boot:run
pause