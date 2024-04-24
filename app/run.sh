#!/bin/bash

# Consistent variable naming with lowercase and underscores
config_dir="/DATA/AppData/casamod"
mod_dir="${config_dir}/mod"
mod_store_dir="${config_dir}/mod_store"
icon_dir="${config_dir}/icon"

www_dir="/var/lib/casaos/www"
index_html="${www_dir}/index.html"
index_html_bak="${index_html}.bak"

start() {
  echo "Starting..."

  # Copy mod_store
  if [[ ! -d "$mod_store_dir" ]]; then
    echo "Creating directory ${mod_store_dir}"
    mkdir -p "$mod_store_dir"
    cp -r /app/mod/* "$mod_store_dir"
  fi

  # Consistent use of -p flag for mkdir
  for dir in "$mod_dir" "$icon_dir"; do
    if [[ ! -d "$dir" ]]; then
      echo "Creating directory ${dir}"
      mkdir -p "$dir"
    fi
  done

  # Consistent use of ln -s with target directory first
  for src_dir in "$mod_dir" "$icon_dir"; do
    target_dir="${www_dir}/${src_dir##*/}"
    if [[ ! -d "$target_dir" ]]; then
      echo "Creating symlink ${src_dir} to ${target_dir}"
      ln -s "$src_dir" "$target_dir"
    fi
  done

  # Create symlink for www_dir in config_dir
  # www_link="${config_dir}/www"
  # if [[ ! -d "$www_link" ]]; then
  #   echo "Creating symlink ${www_dir} to ${www_link}"
  #   ln -s "$www_dir" "$www_link"
  # fi

  # Backup index.html
  if [[ ! -f "$index_html_bak" ]]; then
    cp "$index_html" "$index_html_bak"
    echo "Backed up index.html"
  else
    cp "$index_html_bak" "$index_html"
  fi

  # Build script tags for mods
  script_tags=""
  for mod_path in "$mod_dir"/*; do
    mod_js_path="${mod_path}/mod.js"
    if [[ -f "$mod_js_path" ]]; then
      echo "Reading ${mod_js_path}"
      script_tags+="<script type=\"text/javascript\" src=\"mod/${mod_path##*/}/mod.js\"></script>\n"
    fi
  done
  if [[ -z "$script_tags" ]]; then
    script_tags="\n<!-- CasaMod is loaded, but no mod found -->\n"
  else
    script_tags="\n<!-- CasaMod -->\n${script_tags}"
  fi
  #echo "$script_tags"

  # Modify index.html
  sed -i "s|<\/body>|${script_tags}<\/body>|" "$index_html"
  echo "Modified index.html"

  echo "Keep Running..."
  while true; do
    sleep 1
  done
}

stop() {
  echo "Stopping..."
  if [[ -f "$index_html_bak" ]]; then
    cp "$index_html_bak" "$index_html"
    rm "$index_html_bak"
    echo "Restored index.html"
  else
    echo "Backup file not found, cannot restore index.html"
  fi
  exit 0
}

trap 'stop' SIGINT SIGTERM

case "$1" in
start)
  start
  ;;
stop)
  stop
  ;;
*)
  echo "Invalid command. Supported commands: start, stop"
  exit 1
  ;;
esac
