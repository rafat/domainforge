#!/bin/bash
# Script to test all JavaScript files and categorize them

echo "=== Testing All Script Files ==="
echo

WORKING=0
FAILING=0

# Test each JavaScript file
for file in scripts/*.js; do
    echo "Testing: $(basename "$file")"
    
    # Run the script with a timeout and capture both stdout and stderr
    OUTPUT=$(timeout 10 node "$file" 2>&1)
    EXIT_CODE=$?
    
    # Check if it's working
    if [ $EXIT_CODE -eq 0 ] && [[ $OUTPUT != *"ERR_UNKNOWN_FILE_EXTENSION"* ]] && [[ $OUTPUT != *"TypeError"* ]] && [[ $OUTPUT != *"SyntaxError"* ]]; then
        echo "  ✅ WORKING"
        WORKING=$((WORKING + 1))
    else
        echo "  ❌ FAILING"
        FAILING=$((FAILING + 1))
        # Show brief error reason
        if [[ $OUTPUT == *"ERR_UNKNOWN_FILE_EXTENSION"* ]]; then
            echo "     Reason: TypeScript import issue"
        elif [[ $OUTPUT == *"TypeError"* ]] || [[ $OUTPUT == *"SyntaxError"* ]]; then
            echo "     Reason: Runtime error"
        elif [ $EXIT_CODE -ne 0 ]; then
            echo "     Reason: Exit code $EXIT_CODE"
        else
            echo "     Reason: Unknown"
        fi
    fi
    echo
done

echo "=== Summary ==="
echo "Working scripts: $WORKING"
echo "Failing scripts: $FAILING"
echo "Total scripts: $((WORKING + FAILING))"