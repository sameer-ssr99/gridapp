# GridApp Deployment Script (Local Production Build)

Write-Host "--- Starting GridApp Deployment ---" -ForegroundColor Cyan

# 1. Build Frontend
Write-Host "Step 1: Building Frontend..." -ForegroundColor Yellow
cd frontend
npm install
npm run build
cd ..

# 2. Cleanup and Prepare Backend static folder
Write-Host "Step 2: Preparing Backend static resources..." -ForegroundColor Yellow
$staticDir = "backend/src/main/resources/static"
if (Test-Path $staticDir) {
    Remove-Item -Recurize -Force "$staticDir/*"
} else {
    New-Item -ItemType Directory -Path $staticDir -Force
}

# 3. Copy Frontend Build to Backend
Write-Host "Step 3: Copying frontend dist to backend..." -ForegroundColor Yellow
Copy-Item -Path "frontend/dist/*" -Destination $staticDir -Recurse

# 4. Build Backend JAR
Write-Host "Step 4: Building Backend JAR..." -ForegroundColor Yellow
cd backend
./mvnw clean package -DskipTests
cd ..

Write-Host "--- Deployment Build Complete! ---" -ForegroundColor Green
Write-Host "You can now run the app with: java -jar backend/target/gridapp-0.0.1-SNAPSHOT.jar" -ForegroundColor Cyan
Write-Host "The app will be available at http://localhost:8080" -ForegroundColor Cyan
