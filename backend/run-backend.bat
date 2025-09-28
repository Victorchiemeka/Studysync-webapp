@echo off
echo Starting StudySync Backend...
echo.
echo Checking Java version:
java -version
echo.
echo Attempting to start application...
echo.

REM Try to run with different methods
if exist "mvnw.cmd" (
    echo Using Maven Wrapper...
    mvnw.cmd spring-boot:run
) else if exist "gradlew.bat" (
    echo Using Gradle Wrapper...
    gradlew.bat bootRun
) else (
    echo No wrapper found. Trying system Maven...
    mvn spring-boot:run
)

pause