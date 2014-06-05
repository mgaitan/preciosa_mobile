function PreciosaApi(baseUrl, apiUrl) {
        this.baseUrl = baseUrl;
        this.apiUrl = apiUrl;
        this.preciosQueue = new Queue('precios');

}

PreciosaApi.prototype.getSucursales = function(callback, params) {
    if (typeof(params) === 'undefined') params = {};
    var data = {
        format: 'json',
    };

    if (typeof(params.lat) !== 'undefined' && typeof(params.lon) !== 'undefined') {
        data.lat = params.lat;
        data.lon = params.lon;
        data.radio = conf.radio;
    }

    if (typeof(params.limite) !== 'undefined') {
        data.limite = params.limite;
    }

    if (typeof(params.q) !== 'undefined') {
        data.q = params.q;
    }

    if (peticion_ajax !== null) { peticion_ajax.abort(); }

    peticion_ajax = $.ajax({
        url: this.apiUrl + "/sucursales/",
        dataType: "json",
        crossDomain: true,
        data: data,
        error: function(xhr, text, error) {
            return callback('error', text, params.selector);
        },
        success: function(response) {
            return callback('ok', response, params.selector);
        },
    });

};


PreciosaApi.prototype.getProductos = function(callback, params) {
    if (typeof(params) === 'undefined') params = {};

    var data = {
        format: 'json',
    };

    if (typeof(params.barcode) !== 'undefined') {
        data.barcode = params.barcode;
    }

    if (typeof(params.q) !== 'undefined') {
        data.q = params.q;
    }

    if (peticion_ajax !== null) { peticion_ajax.abort(); }

    peticion_ajax = $.ajax({
        url: API_URL + "/productos/",
        dataType: "json",
        crossDomain: true,
        data: data,
        error: function(xhr, text, error) {
            return callback('error', text, params.selector);
        },
        success: function(response) {
            return callback('ok', response, params.selector);
        },
    });
};


PreciosaApi.prototype.sendPrecios = function() {
    var index = this.preciosQueue.qsize();
    var en_verde = true;
    var that = this;
    while(index) {
        index--;
        if (en_verde) {
            en_verde = false;

            e = this.preciosQueue.get();
            var url = API_URL + '/sucursales/' + e.sid + '/productos/' + e.pid;

            $.ajax({
                global: false,
                type: 'POST',
                dataType: 'json',
                url: url,
                data: {precio: e.precio, created: e.fecha},
                error: function(response) {
                    console.log("error" + response);
                    that.preciosQueue.put(e);
                },
                complete: function(response) {
                    en_verde = true;
                }
            });
        }
    }

    function send() {
        that.sendPrecios();
    }
    setTimeout(send, 3000);
};


PreciosaApi.prototype.savePrecio = function(precio, callback) {
    var fecha = new Date();
    var data = {
        precio: precio,
        fecha: fecha.toJSON(),
        pid: localStorage.producto_id,
        sid: localStorage.sucursal_id
    };
    callback();
    this.preciosQueue.put(data);
    var that = this;
    function send() {
        that.sendPrecios();
    }
    setTimeout(send, 500);
};


PreciosaApi.prototype.getProductoDetalle = function(callbackSuccess, callbackError) {

    if (peticion_ajax !== null) { peticion_ajax.abort(); }
    var url = API_URL + '/sucursales/' + localStorage.sucursal_id + '/productos/' + localStorage.producto_id;
    if (localStorage.readMode === "true") {
        url = API_URL + '/productos_mejores/' + localStorage.producto_id;
    }
    peticion_ajax = $.ajax({
        url: url,
        dataType: "json",
        crossDomain: true,
        data: {
            format: 'json',
            lat: conf.lat,
            lng: conf.lng,
            dias: conf.days,
            radio: conf.radio
        },
        error: function(xhr, text, error) {
            callbackError(xhr, text, error);
        },
        success: function(response) {
            callbackSuccess(response);
        }
    });
};