#!/bin/sh
# Задание 1: nginx WebDAV в WSL
set -eu

detect_lab_dir() {
    for candidate in \
        "/mnt/d/Univer/3_kurs/6sem/PIS/Lab_09" \
        "/mnt/host/d/Univer/3_kurs/6sem/PIS/Lab_09"
    do
        if [ -d "$candidate" ]; then
            echo "$candidate"
            return 0
        fi
    done
    echo "Не найден каталог Lab_09. Установите Ubuntu WSL или откройте проект на диске D:" >&2
    exit 1
}

LAB_DIR="$(detect_lab_dir)"
DATA_DIR="$LAB_DIR/webdav_data"
TEMP_DIR="$LAB_DIR/nginx_temp"
PASSWD_FILE="$LAB_DIR/nginx_conf/.webdavpasswd"
CONF_DST="/etc/nginx/http.d/webdav.conf"

install_packages() {
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update
        sudo apt-get install -y nginx libnginx-mod-http-dav-ext apache2-utils cadaver
    elif command -v apk >/dev/null 2>&1; then
        apk add --no-cache nginx nginx-mod-http-dav-ext apache2-utils cadaver
    else
        echo "Установите Ubuntu: wsl --install -d Ubuntu" >&2
        exit 1
    fi
}

echo "=== Пакеты ==="
install_packages

echo "=== Каталоги ==="
mkdir -p "$DATA_DIR" "$TEMP_DIR"

echo "=== Пользователь webdavuser / password123 ==="
htpasswd -cb "$PASSWD_FILE" webdavuser password123
NGINX_PASSWD="/etc/nginx/.webdavpasswd"
if command -v apt-get >/dev/null 2>&1; then
    sudo cp "$PASSWD_FILE" "$NGINX_PASSWD"
    sudo chmod 644 "$NGINX_PASSWD"
else
    cp "$PASSWD_FILE" "$NGINX_PASSWD"
    chmod 644 "$NGINX_PASSWD"
fi

echo "=== Конфиг nginx ($LAB_DIR) ==="
mkdir -p /etc/nginx/http.d
cat >"$CONF_DST" <<EOF
server {
    listen 8081;
    server_name localhost;

    location /webdav/ {
        alias $DATA_DIR/;

        dav_methods PUT DELETE MKCOL COPY MOVE;
        dav_ext_methods PROPFIND OPTIONS;
        create_full_put_path on;
        dav_access user:rw group:rw all:rw;

        client_body_temp_path $TEMP_DIR;
        client_max_body_size 100M;

        auth_basic "WebDAV";
        auth_basic_user_file $NGINX_PASSWD;
    }
}
EOF

if command -v apt-get >/dev/null 2>&1; then
    sudo cp "$CONF_DST" /etc/nginx/sites-available/webdav.conf
    sudo ln -sf /etc/nginx/sites-available/webdav.conf /etc/nginx/sites-enabled/webdav.conf
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo service nginx restart
else
    mkdir -p /run/nginx /var/lib/nginx/tmp
    nginx -t
    if pgrep nginx >/dev/null 2>&1; then
        echo "nginx уже запущен — применяем конфиг (reload)"
        nginx -s reload
    else
        rm -f /run/nginx/nginx.pid
        nginx
    fi
fi

echo ""
echo "WebDAV: http://localhost:8081/webdav/"
echo "Логин: webdavuser  Пароль: password123"
echo "Проверка: cadaver http://localhost:8081/webdav/"
