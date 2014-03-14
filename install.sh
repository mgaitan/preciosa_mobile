 #!/bin/sh
 wget https://build.phonegap.com/apps/762757/download/android
 mv android preciosa.apk
 adb install -r preciosa.apk
 rm preciosa.apk