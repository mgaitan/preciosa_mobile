function Configuration() {
    this.radio = 10;
    this.days = 20;
    this.lat = -64.183;
    this.lng = -64.183;
    this.sucursalId = undefined;
    this.sucursalName = undefined;
    this.placeName = undefined;

    if (localStorage.latitud !== undefined  && localStorage.longitud !== undefined) {
        this.lat = localStorage.latitud;
        this.lng = localStorage.longitud;
    }

    if(localStorage.placeName !== undefined) {
        this.placeName = localStorage.placeName;
    }

    if(localStorage.conf_radio !== undefined) {
        this.radio = localStorage.conf_radio;
    }

    if(localStorage.conf_days !== undefined) {
        this.days = localStorage.conf_dias;
    }

    if(localStorage.sucursalId !== undefined) {
        this.sucursalId = localStorage.sucursalId;
    }

    if(localStorage.sucursalName !== undefined) {
        this.sucursalName = localStorage.sucursalName;
    }
}

Configuration.prototype.setPlaceName = function(placeName) {
    this.placeName = placeName;
    localStorage.placeName = placeName;
};

Configuration.prototype.setSucursalId = function(id) {
    this.sucursalId = id;
    localStorage.sucursalId = id;
};

Configuration.prototype.setSucursalName = function(name) {
    this.sucursalName = name;
    localStorage.sucursalName = name;
};


Configuration.prototype.setRadio = function(radio) {
    this.radio = radio;
    localStorage.conf_radio = radio;
};

Configuration.prototype.setDays = function(days) {
    this.days = days;
    localStorage.conf_dias = days;
};

Configuration.prototype.setLat = function(lat) {
    this.lat = lat;
    localStorage.latitud = lat;
};

Configuration.prototype.setLng = function(lng) {
    this.lng = lng;
    localStorage.longitud = lng;
};