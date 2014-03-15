#!/bin/sh
#
# Cada vez que se hace un push, github hace un post a la API
# de phonegap para que recompile la aplicación.
#
# https://build.phonegap.com/apps/[appid]/build/?auth_token=[token]
#
wget https://build.phonegap.com/apps/762757/download/android
mv android preciosa.apk
adb install -r preciosa.apk
rm preciosa.apk