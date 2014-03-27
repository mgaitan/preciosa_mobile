#!/bin/sh
#
# Github hace un post a la direccion
# https://build.phonegap.com/apps/<APP_ID>/push/?auth_token=<TOKEN>
#
rm preciosa.apk
wget https://build.phonegap.com/apps/762757/download/android
mv android preciosa.apk
# desinstalo la version que exista
adb shell pm uninstall com.phonegap.preciosa
# instalo una nueva
adb install -r preciosa.apk
