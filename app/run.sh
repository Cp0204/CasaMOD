#!/bin/bash

# Consistent variable naming with lowercase and underscores
config_dir="/DATA/AppData/casamod"
mod_dir="${config_dir}/mod"
mod_store_dir="${config_dir}/mod_store"
icon_dir="${config_dir}/icon"

www_dir="/var/lib/casaos/www"
index_html="${www_dir}/index.html"
index_html_bak="${index_html}.bak"

casaos_framework="gin"

host_exec() {
  nsenter -m -u -i -n -p -t 1 sh -c "$1"
}

start() {
  echo "Starting..."

  # v0.4.10+ migrate gin to echo
  casaos_ver=$(host_exec "casaos -v | tr -d 'v'")
  if [[ $(printf "%s\n" "$casaos_ver" "0.4.9" | sort -V | tail -n1) == "$casaos_ver" ]]; then
    casaos_framework="echo"
    echo "CasaOS v$casaos_ver"
  fi

  # Copy mod_store
  if [[ ! -d "$mod_store_dir" ]]; then
    echo "Creating directory ${mod_store_dir}"
    mkdir -p "$mod_store_dir"
    cp -r /app/mod/* "$mod_store_dir"
    echo -e "Delete this folder and it will be recreated when the new version of the container is started.\n\n删除本文件夹，新版本容器启动时将重建。" >>"${mod_store_dir}/Recreated_Store.txt"
  fi

  # Process mapping directory
  for dir in "$mod_dir" "$icon_dir"; do
    #Creating directory
    if [[ ! -d "$dir" ]]; then
      echo "Creating directory ${dir}"
      mkdir -p "$dir"
      # Creating README
      if [[ "$dir" == "$icon_dir" ]]; then
        echo -e "This folder can be accessed by http(s)://casaos/icon/*, e.g. you can place app1.png and fill in icon/app1.png in the app icon settings.\n\n本文件夹内容可以被 http(s)://casaos/icon/* 访问，例如你可以放置 app1.png ，在应用图标设置中填 icon/app1.png" >>"${icon_dir}/README.txt"
      fi
    fi
    # Creating symlink
    symlink_dir="${www_dir}/${dir##*/}"
    if [[ ! -d "$symlink_dir" ]]; then
      echo "Creating symlink ${dir} to ${symlink_dir}"
      ln -s "$dir" "$symlink_dir"
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
    echo "Backup index.html"
  else
    cp "$index_html_bak" "$index_html"
  fi

  # Build tags for mods
  js_tags=""
  css_tags=""
  for mod_path in "$mod_dir"/*; do
    mod_js_path="${mod_path}/mod.js"
    mod_css_path="${mod_path}/mod.css"
    if [[ -f "$mod_js_path" ]]; then
      echo "Reading ${mod_js_path}"
      js_tags+="<script type=\"text/javascript\" src=\"mod/${mod_path##*/}/mod.js\"></script>\n"
    fi
    if [[ -f "$mod_css_path" ]]; then
      echo "Reading ${mod_css_path}"
      css_tags+="<link href=\"/mod/${mod_path##*/}/mod.css\" rel=\"stylesheet\">\n"
    fi
  done
  if [[ -z "$js_tags" ]]; then
    js_tags="\n<!-- CasaMOD is loaded, but no js found -->\n"
  else
    js_tags="\n<!-- CasaMOD js -->\n${js_tags}"
  fi
  #echo "$js_tags"
  if [[ -z "$css_tags" ]]; then
    css_tags="\n<!-- CasaMOD is loaded, but no css found -->\n"
  else
    css_tags="\n<!-- CasaMOD css -->\n${css_tags}"
  fi
  #echo "$css_tags"

  # Modify index.html
  sed -i "s|<title>|${css_tags}<title>|" "$index_html"
  sed -i "s|<\/body>|${js_tags}<\/body>|" "$index_html"
  echo "Modified index.html"

  # Restart gateway
  if [[ $casaos_framework == "echo" ]]; then
    host_exec "systemctl restart casaos-gateway.service"
    echo "Restarted casaos-gateway.service"
  fi

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
    if [[ $casaos_framework == "echo" ]]; then
      host_exec "systemctl restart casaos-gateway.service"
      echo "Restarted casaos-gateway.service"
    fi
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
