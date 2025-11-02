#!/usr/bin/env bash
set -euo pipefail

# Check if associative arrays are supported (Bash 4+)
if [[ "${BASH_VERSINFO:-0}" -lt 4 ]]; then
    echo "Warning: This script works best with Bash version 4 or higher."
    echo "Falling back to basic color support..."
    USE_BASIC_COLORS=1
else
    USE_BASIC_COLORS=0
    # Define the associative array for color and style codes
    declare -A tput_codes=(
        ["BLACK"]="$(tput setaf 0 2>/dev/null || echo '')"
        ["RED"]="$(tput setaf 1 2>/dev/null || echo '')"
        ["GREEN"]="$(tput setaf 2 2>/dev/null || echo '')"
        ["YELLOW"]="$(tput setaf 3 2>/dev/null || echo '')"
        ["BLUE"]="$(tput setaf 4 2>/dev/null || echo '')"
        ["MAGENTA"]="$(tput setaf 5 2>/dev/null || echo '')"
        ["CYAN"]="$(tput setaf 6 2>/dev/null || echo '')"
        ["WHITE"]="$(tput setaf 7 2>/dev/null || echo '')"
        ["BOLD"]="$(tput bold 2>/dev/null || echo '')"
        ["UNDERLINE"]="$(tput smul 2>/dev/null || echo '')"
        ["NC"]="$(tput sgr0 2>/dev/null || echo '')"
    )
fi

# Basic color fallback variables with tput error handling
for color_name in RED GREEN YELLOW WHITE BOLD NC; do
    case "$color_name" in
        RED) code=1 ;;
        GREEN) code=2 ;;
        YELLOW) code=3 ;;
        WHITE) code=7 ;;
        BOLD) eval "${color_name}_BASIC=\"\$(tput bold 2>/dev/null || echo '')\""; continue ;;
        NC) eval "${color_name}_BASIC=\"\$(tput sgr0 2>/dev/null || echo '')\""; continue ;;
    esac
    eval "${color_name}_BASIC=\"\$(tput setaf $code 2>/dev/null || echo '')\""
done

# Check if terminal supports Unicode/emojis
check_unicode_support() {
    [[ "${LANG:-}" =~ UTF-8 ]] || [[ "${LC_ALL:-}" =~ UTF-8 ]]
}

# Set up emoji variables with fallbacks
if check_unicode_support; then
    ICON_SEARCH="🔍"
    ICON_BROOM="🧹"
    ICON_PACKAGE="📦"
    ICON_FILE="💾"
    ICON_SPARKLE="✨"
    ICON_CHECK="✓"
    ICON_CROSS="✗"
    ICON_WARNING="⚠️ "
else
    ICON_SEARCH="[SEARCH]"
    ICON_BROOM="[CLEAN]"
    ICON_PACKAGE="[PACKAGE]"
    ICON_FILE="[FILE]"
    ICON_SPARKLE="[DONE]"
    ICON_CHECK="[OK]"
    ICON_CROSS="[X]"
    ICON_WARNING="[!]"
fi

# Function to echo with color, style, and optional -n flag
# Supports \n (newline) and \t (tab) in text
cecho() {
    local no_newline=0
    local format_string=""
    
    if [[ "$1" == "-n" ]]; then
        no_newline=1
        shift
    fi
    
    local text="${!#}"
    
    if [[ "$USE_BASIC_COLORS" -eq 1 ]]; then
        local color_var="${1^^}_BASIC"
        format_string="${!color_var:-}"
        
        if [[ "${2:-}" == "BOLD" ]] || [[ "${2^^}" == "BOLD" ]]; then
            format_string+="${BOLD_BASIC}"
        fi
        
        printf "%b%s" "${format_string}${text}${NC_BASIC}" "$([[ $no_newline -eq 0 ]] && echo $'\n')"
        return 0
    fi
    
    for arg in "${@:1:$(($#-1))}"; do
        local key=${arg^^}
        if [[ -n "${tput_codes[$key]:-}" ]]; then
            format_string+="${tput_codes[$key]}"
        else
            echo "Error: Unknown format or color '$arg'" >&2
            return 1
        fi
    done
    
    if [[ "$no_newline" -eq 1 ]]; then
        printf "%b" "${format_string}${text}${tput_codes[NC]}"
    else
        printf "%b\n" "${format_string}${text}${tput_codes[NC]}"
    fi
}

# Display header
header() {
    local header_1="░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░"
    local header_2="░                                                          ░"
    local header_3a="░ "
    local header_3b="${ICON_BROOM} Cleaning up Node Modules, Package-Lock, and NPM Cache"
    local header_3c=" ░"
    
    cecho YELLOW "\t${header_1}"
    cecho YELLOW "\t${header_2}"
    cecho -n YELLOW "\t${header_3a}"
    cecho -n WHITE BOLD "${header_3b}"
    cecho YELLOW "${header_3c}"
    cecho YELLOW "\t${header_2}"
    cecho YELLOW "\t${header_1}"
    echo
    echo
}

# Function to simulate sleep with a progress bar
# Usage: sleep_progress <duration_in_seconds> ["<message>"]
sleep_progress() {
    local duration=$1
    local tab="${2:-""}"
    local message="${3:-}" #"${2:-Waiting}"
    local interval=0.1
    local steps=$(awk "BEGIN {print int($duration / $interval)}")
    local completed_chars=0
    local bar_width=40
    local col_width=50

    # Clear previous line and print initial message
    printf "${tab}%-${col_width}s" "$message"
    
    for ((i=0; i<=steps; i++)); do
        local percent=$(awk "BEGIN {printf \"%.0f\", ($i / $steps) * 100}")
        local completed_chars=$(awk "BEGIN {printf \"%.0f\", ($bar_width * $percent / 100)}")
        local remaining_chars=$((bar_width - completed_chars))
        local bar=$(printf "%${completed_chars}s" | tr ' ' 'o')
        local empty=$(printf "%${remaining_chars}s" | tr ' ' '-')
        printf "\r${tab}%-${col_width}s [%s%s] %3s%%" "$message" "${YELLOW_BASIC}$bar${NC_BASIC}" "$empty" "${GREEN_BASIC}$percent${NC_BASIC}"

        # Sleep for the interval
        sleep $interval
    done

    # Print a newline character when finished to move the cursor down
    printf "\n"
}

# Check and stop watch processes
stop_watch_processes() {
    local processes_found=0
    if pgrep -f "npm.*run.*watch" > /dev/null 2>&1; then
        pkill -f "npm.*run.*watch"
        processes_found=1
    fi
    if pgrep -f "tsc" > /dev/null 2>&1; then
        pkill -f "tsc"
        processes_found=1
    fi
    if pgrep -f "eslint" > /dev/null 2>&1; then
        pkill -f "eslint"
        processes_found=1
    fi
    if [[ $processes_found -eq 1 ]]; then
        sleep_progress 2 "" "${ICON_SEARCH} Stopping watched processes..."
    else
        cecho GREEN "${ICON_CHECK} No watch processes found"
    fi
}

# Removal function
remove_items() {
    local icon="$1"
    local description="$2"
    shift 2
    
    #cecho "${icon} ${description}..."
    
    while [[ $# -gt 0 ]]; do
        local path="$1"
        local label="$2"
        local type="$3"
        local wait="${4:-1}"
        shift 4
        
        local exists=false
        if [[ "$type" == "d" && -d "$path" ]] || [[ "$type" == "f" && -f "$path" ]]; then
            exists=true
        fi
        
        if [[ "$exists" == true ]]; then
            rm -rf "$path"
            # Short pause to ensure filesystem stability
            sleep_progress $wait "" "${icon} Removing ${path}..."
        else
            local item_type=$([[ "$type" == "d" ]] && echo "directory" || echo "file")
            cecho YELLOW "${ICON_CROSS} No ${item_type} found: ${path}"
        fi
    done
}

# Add a special vsix removal function or handle it separately
remove_vsix() {
    local wait="${1:-1}"
    shopt -s nullglob
    local vsix_files=(*.vsix)
    
    if [[ ${#vsix_files[@]} -gt 0 ]]; then
        rm -f "${vsix_files[@]}"
        sleep_progress $wait "" "${ICON_FILE} Removing *.vsix files..."
    else
        cecho YELLOW "${ICON_CROSS} No .vsix files found"
    fi
}

# Clear npm cache
clear_cache() {
    local wait="${1:-2}"
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        cecho RED "${ICON_CROSS} npm not found, skipping cache clear"
        return 0
    fi
    
    if npm cache clean --force --loglevel error 2>/dev/null; then
        sleep_progress $wait "" "${ICON_BROOM} Clearing npm cache..."
    else
        cecho YELLOW "${ICON_CROSS} Failed to clear cache (may require sudo)"
    fi
}

# Display completion message
complete() {
    cecho GREEN BOLD "\n${ICON_SPARKLE} Cleanup complete! ${ICON_SPARKLE}\n"
}

# Cleanup function for trapped errors
cleanup_on_error() {
    cecho RED BOLD "\n${ICON_CROSS} Script interrupted or encountered an error! ${ICON_CROSS}"
    exit 1
}

# Set up trap for clean error handling
trap cleanup_on_error ERR INT TERM

# Main function
main() {
    clear
    header
    stop_watch_processes
    clear_cache 0.5
    remove_items "$ICON_PACKAGE" "Removing node_modules directory" \
        "./node_modules" "" "d" 4\
        "./client/node_modules" " from client" "d" 2\
        "./server/node_modules" " from server" "d" 2
    remove_items "$ICON_PACKAGE" "Removing output directory" \
        "./client/out" " from client" "d" 2\
        "./server/out" " from server" "d" 2
    remove_items "$ICON_FILE" "Removing package-lock.json" \
        "./package-lock.json" "" "f" 1\
        "./client/package-lock.json" " from client" "f" 1\
        "./server/package-lock.json" " from server" "f" 1
    remove_items "$ICON_FILE" "Removing tsconfig.buildinfo" \
        "./client/tsconfig.tsbuildinfo" " from client" "f" 1\
        "./server/tsconfig.tsbuildinfo" " from server" "f" 1
    remove_vsix 0.5
    complete
}

main