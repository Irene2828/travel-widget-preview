#!/bin/bash
git init
git add .
git commit -m "feat: Initial commit for travel widget with polished UI"
gh repo create travel-widget-preview --public --source=. --remote=origin --push
echo "Repository created and pushed successfully!"
