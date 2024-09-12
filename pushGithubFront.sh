#!/bin/bash
echo "Starting pushGithubFront.sh script..."
# Disable automatic exit on error
set +e

# Configuration
REPO_DIR="/c/Users/13146/Desktop/Python/Github/Notely1/Notely/notely-app1"    # Update this to the path of your local repo
BRANCH_NAME="main"                     # Update this to your branch name

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Function to handle errors
handle_error() {
    log_message "Error occurred: $1"
    read -p "Press enter to close..."
    exit 1
}

# Prompt for commit message
read -p "Enter commit message: " COMMIT_MESSAGE

# Navigate to the repository directory
log_message "Changing to repository directory..."
cd "$REPO_DIR" || handle_error "Repository directory not found"

# Add all changes to git
log_message "Adding changes to git..."
git add . || handle_error "Failed to add changes"

echo "Now committing changes..."
# Commit changes
log_message "Committing changes..."
git commit -m "$COMMIT_MESSAGE" || handle_error "Failed to commit changes"

echo "Commit message: $COMMIT_MESSAGE"
echo "Now pushing changes to GitHub..."
# Push changes to GitHub

# Ask if the user wants to force push
read -p "Do you want to force push? (y/N): " force_push

log_message "Pushing changes to GitHub..."
if [ "$force_push" = "y" ] || [ "$force_push" = "Y" ]; then
    git push origin "$BRANCH_NAME" --force || handle_error "Failed to force push changes"
    log_message "Changes force pushed to GitHub repository."
else
    git push origin "$BRANCH_NAME" || handle_error "Failed to push changes"
    log_message "Changes pushed to GitHub repository."
fi

# Keep the terminal open
read -p "Press enter to close..."

# Keep the terminal open
read -p "Press enter to close..."
