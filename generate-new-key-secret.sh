#!/bin/bash

length=$1
algorithm=${2: -base64}

if [ -z "$length" ]; then
    echo "Error: No length provided."
    echo "Usage: $0 <length> [algorithm]"
    echo "  algorithm: 'hex' or 'base64' (default: base64)"
    echo "  length: Number of random bytes to generate"
    exit 1
fi

# Validate length is a number
if ! [[ "$length" =~ ^[0-9]+$ ]]; then
    echo "Error: Length must be a positive integer."
    exit 1
fi

# Validate algorithm
if [[ "$algorithm" != "hex" && "$algorithm" != "base64" ]]; then
    echo "Error: Algorithm must be 'hex' or 'base64'."
    exit 1
fi

result=$(openssl rand "-$algorithm" "$length")

if [ -z "$result" ]; then
    echo "Error: Something went wrong while generating"
    exit 0
fi

echo "Generated ${length}-byte random string:" 
echo "${result}"