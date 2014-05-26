APK_NAME = preciosa.apk
APK_ID = com.phonegap.preciosa_peru
PHONEGAP_BUILD_ID = 762757

all: clean $(APK_NAME) reinstall

clean:
	rm -f $(APK_NAME)

$(APK_NAME):
	wget -c https://build.phonegap.com/apps/$(PHONEGAP_BUILD_ID)/download/android
	mv android $(APK_NAME)

uninstall:
	# desinstalo la version que exista
	adb shell pm uninstall $(APK_ID)

reinstall: uninstall install

install: $(APK_NAME)
	# instalo una nueva
	adb install -r $(APK_NAME)


.PHONY: clean install reinstall uninstall