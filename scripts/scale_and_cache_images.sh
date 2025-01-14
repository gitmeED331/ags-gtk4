#!/bin/bash

CACHE_DIR="/tmp/wallpaper_cache"
WALLPAPER_DIR="$HOME/Pictures/Wallpapers"

mkdir -p "$CACHE_DIR"

get_cached_image_path() {
    local original_path="$1"
    local file_name
    file_name=$(basename "$original_path")
    echo "${CACHE_DIR}/${file_name}"
}

scale_and_cache_image() {
    local original_path="$1"
    local width="$2"
    local height="$3"
    local cached_image_path
    cached_image_path=$(get_cached_image_path "$original_path")

    if [ -f "$cached_image_path" ]; then
        echo "$cached_image_path"
        return 0
    fi

    convert "$original_path" -resize "${width}x${height}" "$cached_image_path"
    if [ $? -eq 0 ]; then
        echo "$cached_image_path"
    else
        echo "Error scaling image: $original_path" >&2
        echo "$original_path"
    fi
}

get_wallpapers_from_folder() {
    local wallpapers=()
    local unique_basenames=()

    while IFS= read -r -d '' file; do
        local base_name
        base_name=$(basename "$file" | sed 's/\.[^.]*$//')

        if [[ ! " ${unique_basenames[@]} " =~ " ${base_name} " ]]; then
            unique_basenames+=("$base_name")
            wallpapers+=("$file")
        fi
    done < <(find "$WALLPAPER_DIR" -type f \( -iname "*.png" -o -iname "*.jpg" -o -iname "*.jpeg" \) -print0)

    IFS=$'\n' sorted_wallpapers=($(sort <<<"${wallpapers[*]}"))
    unset IFS

    echo "${sorted_wallpapers[@]}"
}

main() {
    local width=100
    local height=100

    wallpapers=$(get_wallpapers_from_folder)

    for wallpaper in $wallpapers; do
        scale_and_cache_image "$wallpaper" "$width" "$height"
    done
}

if [ $# -eq 3 ]; then
    scale_and_cache_image "$1" "$2" "$3"
    exit 0
fi

if [ $# -eq 0 ]; then
    main
fi
