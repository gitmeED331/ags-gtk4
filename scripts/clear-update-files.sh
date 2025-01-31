#!/bin/bash

# Clear update files 
> /tmp/pac-updates
> /tmp/aur-updates 

# Optionally, add a check to ensure the files are empty after truncation
if [[ -s /tmp/pac-updates || -s /tmp/aur-updates ]]; then
  echo "Failed to clear update files." >&2
  exit 1
fi

exit 0
