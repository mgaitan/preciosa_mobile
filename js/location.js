function Location() {
    this.map = null;
    this.marker = null;
    this.infowindow = null;
    this.lat = null;
    this.lng = null;
    this.location = null;
    this.input = null;
    this.autocomplete = null;
}

Location.prototype.initMap = function(selectorId) {
    var lat = -31.218;
    var lng = -64.183;
    var placeName = "";

    if (conf.lat !== undefined  && conf.lng !== undefined) {
        lat = conf.lat;
        lng = conf.lng;
    }
    if(localStorage.placeName !== undefined) {
        placeName = conf.placeName;
    }

    //opciones del mapa
    mapOptions = {
        zoom: 17,
        center: new google.maps.LatLng(lat, lng),
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $('#' + selectorId).css('height', this.getRealContentHeight());

    this.map = new google.maps.Map(document.getElementById(selectorId),
    mapOptions);
    $("#ubicacion-texto").text(localStorage.placeName);

    //marcador con informacion.
    this.infowindow = new google.maps.InfoWindow();
    this.marker = new google.maps.Marker({
        map: this.map,
        anchorPoint: new google.maps.Point(0, -29)
    });
    this.setMarker(lng, lat, placeName);
};

Location.prototype.getLocation = function(successCallback, errorCallback) {
    // Devuelve la ubicacion guardada en localStorage,
    // o la del navigator.

    // La función espera dos funciones, una para llamar cuando
    // se obtiene correctamente una locación y otro callback
    // para llamar en caso de error.
    if (localStorage.latitud !== undefined  && localStorage.longitud !== undefined) {
        console.log("Recuperando latitud y longitud desde localStorage.");

        var ubicacion = {lat: localStorage.latitud, lng: localStorage.longitud};
        successCallback(ubicacion);

    } else {

        if (!navigator.geolocation) {
            errorCallback({error: "El navegador no soporta geo-posicionamiento."});
            return;
        }

        var options = { enableHighAccuracy:false,
                       timeout: 15000};
        //llamar a geolocation
        navigator.geolocation.getCurrentPosition(function(pos) {
            var ubicacion = {lat: pos.coords.latitude, lng: pos.coords.longitude};
            localStorage.latTmp = ubicacion.latitud;
            localStorage.lngTmp = ubicacion.longitud;
            successCallback(ubicacion);
        }, function(error) {
            errorCallback({error: "No se pudo conseguir la ubicacion del equipo (motivo: " + error.message + ")"});
        }, options);
    }
};


Location.prototype.setMarker = function(lng, lat, address, city) {
    //Hide the marker and infowindow.
    this.infowindow.close();
    this.marker.setVisible(false);
    localStorage.latTmp = lat;
    localStorage.lngTmp = lng;
    var center = new google.maps.LatLng(lat, lng);
    this.map.setCenter(center);
    this.map.setZoom(17);

    this.marker.setPosition(center);
    this.marker.setVisible(true);
    if (city) {
        this.infowindow.setContent('<div><strong>' + city + '</strong><br>' + address);
    } else {
        this.infowindow.setContent('<div><strong>' + address + '</strong><br>');
    }
    this.infowindow.open(this.map, this.marker);
};


Location.prototype.setMapEvents = function() {
    var that = this;
    google.maps.event.addListener(this.map, 'click', function(e) {
        //Guardamos temporalmente las coordenadas.
        localStorage.latTmp = e.latLng.lat();
        localStorage.lngTmp = e.latLng.lng();
        that.geocode(e.latLng.lat(), e.latLng.lng());
    });
};

Location.prototype.geocode = function(lat, lng) {
    var geocoder = new google.maps.Geocoder();
    var point = new google.maps.LatLng(lat, lng);
    var that = this;
    geocoder.geocode({'latLng': point}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            //si obtuvo el geocodigo generamos un marcador
            if (results[0]) {
                $('#ubicacion_input').val(results[0].formatted_address);
                var lng = results[0].geometry.location.lng();
                var lat = results[0].geometry.location.lat();
                that.setMarker(lng, lat, results[0].formatted_address);
            } else {
                alert('No se encontro lugar');
            }
        } else {
          alert('falló, pruebe de nuevo');
        }
    });
};

Location.prototype.initMapSearchInput = function(inputId) {
    this.input = document.getElementById(inputId);
    this.autocomplete = new google.maps.places.Autocomplete(this.input);
    //bindieamos al mapa.
    this.autocomplete.bindTo('bounds', this.map);
    var that = this;
    //si se elige un lugar mostrarlo en el mapa.
    //codigo robado de aca:
    //https://google-developers.appspot.com/maps/documentation/javascript/examples/places-autocomplete
    google.maps.event.addListener(this.autocomplete, 'place_changed', function() {
        that.infowindow.close();
        that.marker.setVisible(false);
        var place = that.autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }
        localStorage.lngTmp = place.geometry.location.lng();
        localStorage.latTmp = place.geometry.location.lat();

        var address = '';
        if (place.address_components) {
          address = [
            (place.address_components[0] && place.address_components[0].short_name || ''),
            (place.address_components[1] && place.address_components[1].short_name || ''),
            (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
        }

        that.infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        that.setMarker(localStorage.lngTmp, localStorage.latTmp, address, place.name);
    });
};

Location.prototype.getRealContentHeight = function() {
    var header = $.mobile.activePage.find("div[data-role='header']:visible");
    var footer = $.mobile.activePage.find("div[data-role='footer']:visible");
    var content = $.mobile.activePage.find("div[data-role='content']:visible:visible");
    var viewport_height = $(window).height();

    var content_height = viewport_height - header.outerHeight() - footer.outerHeight();
    if((content.outerHeight() - header.outerHeight() - footer.outerHeight()) <= viewport_height) {
        content_height -= (content.outerHeight() - content.height());
    }
    return content_height/1.5;
};

