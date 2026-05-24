#!/bin/sh
# Быстрая проверка WebDAV через cadaver (задание 1)
set -eu

URL="http://localhost:8081/webdav/"
USER="webdavuser"
PASS="password123"

cadaver() {
    command -v cadaver >/dev/null || { echo "cadaver не установлен"; exit 1; }
}

run() {
    printf '%s\n' "$PASS" | cadaver -t "$URL" <<EOF
mkcol test_cadaver
put $LAB_DIR/myfile.txt myfile.txt
get myfile.txt
copy myfile.txt copied.txt
move myfile.txt test_cadaver/myfile.txt
delete copied.txt
delete test_cadaver
quit
EOF
}

LAB_DIR="/mnt/d/Univer/3_kurs/6sem/PIS/Lab_09"
export LAB_DIR
run
