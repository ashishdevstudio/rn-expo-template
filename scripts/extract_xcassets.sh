#!/bin/bash

# --- UNIVERSAL XCASSET EXTRACTOR (CLEAN FOLDERS) ---

if [ "$#" -ne 2 ]; then
    echo "⚠️  Missing paths!"
    echo "Usage: ./extract_xcassets.sh <source_xcassets_path> <destination_rn_folder>"
    exit 1
fi

SOURCE_XCASSETS=${1%/}
DESTINATION_DIR=${2%/}

if [ ! -d "$SOURCE_XCASSETS" ]; then
    echo "❌ Error: Cannot find source directory at: $SOURCE_XCASSETS"
    exit 1
fi

echo "🚀 Starting clean folder asset extraction..."
mkdir -p "$DESTINATION_DIR"

find "$SOURCE_XCASSETS" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.svg" \) | while read -r FILE; do
    
    # 1. Get the folder containing the image (e.g., "Assets.xcassets/Auth/Arrow.imageset")
    IMAGE_SET_DIR=$(dirname "$FILE")
    
    # 2. Get the folder ABOVE the imageset (e.g., "Assets.xcassets/Auth")
    PARENT_DIR=$(dirname "$IMAGE_SET_DIR")
    
    # 3. Calculate the relative path to maintain your overarching folder groups
    RELATIVE_DIR="${PARENT_DIR#$SOURCE_XCASSETS}"
    
    # Strip leading slash if it exists to prevent root directory issues
    RELATIVE_DIR=$(echo "$RELATIVE_DIR" | sed 's/^\///')
    
    # 4. Create target path and copy
    TARGET_DIR="$DESTINATION_DIR/$RELATIVE_DIR"
    mkdir -p "$TARGET_DIR"
    
    cp "$FILE" "$TARGET_DIR/"
    
done

# Recount files
FINAL_COUNT=$(find "$DESTINATION_DIR" -type f | wc -l)

echo "✅ Extraction complete!"
echo "📂 Skipped .imageset wrappers and grouped images correctly."
echo "📦 Successfully moved $FINAL_COUNT assets."