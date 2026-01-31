#!/bin/bash
set -e

echo "Building Docker image as 'tornwarbridge'..."
docker build -t tornwarbridge .

echo "Running container (map port 3000)..."
docker run -d -p 3000:3000 --name tornwarbridge_test tornwarbridge
sleep 5

echo "Testing if containerized server is up..."
if curl -s http://localhost:3000 | grep -q "Torn Command Hub"; then
    echo "✅ Docker server running! View at http://localhost:3000"
else
    echo "❌ Docker container did not start app correctly."
    docker logs tornwarbridge_test
    docker rm -f tornwarbridge_test
    exit 1
fi

echo "To view logs: docker logs tornwarbridge_test"
echo "To stop/remove: docker rm -f tornwarbridge_test"