#!/bin/bash
# Script to identify which files have TypeScript import issues

echo "=== Identifying TypeScript Import Issues ==="
echo

for file in scripts/*.js; do
    # Check if the file contains TypeScript import statements
    if grep -q "import.*\\.ts" "$file" 2>/dev/null; then
        echo "❌ $file - Has TypeScript imports"
    elif grep -q "await import.*\\.ts" "$file" 2>/dev/null; then
        echo "❌ $file - Has dynamic TypeScript imports"
    else
        # Check if it actually runs without errors
        timeout 5 node "$file" >/dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ $file - Works correctly"
        else
            echo "⚠️  $file - Other issue (not TypeScript imports)"
        fi
    fi
done