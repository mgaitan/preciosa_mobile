/* Este es el modulo js cliente de la API rest */

var BASE_API_URL = "http://preciosdeargentina.com.ar/api/v1";
var BASE_IMG_URL = "http://preciosdeargentina.com.ar";

var precios_queue = new Queue('precios');

var consultar_sucursales = function(callback, params) {
    if (typeof(params) === 'undefined') params = {};

    var data = {
        format: 'json',
    }

    if (typeof(params.lat) !== 'undefined' && typeof(params.lon) !== 'undefined') {
        data.lat = params.lat;
        data.lon = params.lon;
        data.radio = 10;
    }

    if (typeof(params.limite) !== 'undefined') {
        data.limite = params.limite;
    }

    if (typeof(params.q) !== 'undefined') {
        data.q = params.q;
    }

    $.ajax({
        url: BASE_API_URL + "/sucursales/",
        dataType: "json",
        crossDomain: true,
        data: data,
        error: function(xhr, text, error) {
            return callback('error', text, params.selector);
        },
        success: function(response) {
            return callback('ok', response, params.selector);
        },
    })
};

var consultar_productos = function(callback, params) {
    if (typeof(params) === 'undefined') params = {};

    var data = {
        format: 'json',
    }

    if (typeof(params.barcode) !== 'undefined') {
        data.barcode = params.barcode;
    }

    if (typeof(params.q) !== 'undefined') {
        data.q = params.q;
    }

    $.ajax({
        url: BASE_API_URL + "/productos/",
        dataType: "json",
        crossDomain: true,
        data: data,
        error: function(xhr, text, error) {
            return callback('error', text, params.selector);
        },
        success: function(response) {
            return callback('ok', response, params.selector);
        },
    })
};

var mostrar_sucursales = function(status, response, selector) {
    var $ul = selector,
    html = '';

    if (response.count > 0){
        $.each(response.results, function (i, obj) {
            html += '<li><a href="#sucursal" data-id="'+obj.id+'" class="sucursal">' +
                    '<h2>'+ obj.nombre +'</h2>' +
                    '<p><i class="fa fa-location-arrow"></i> '+obj.direccion+', ' +obj.ciudad+'</p>' +
                    '</a></li>';
        });
    }
    else {
        html = '<li><a class="ui-btn ui-shadow ui-corner-all ui-icon-alert ui-btn-icon-left">No se encontraron resultados</a></li>';
    }

    $ul.html(html);
    $ul.listview('refresh');
    $ul.trigger('updatelayout');
};



var get_ubicacion = function(callback){
    // devuelve la ubicacion guardada en localStorage,
    // o la del navigator.
    // como fallback la del bunker de preciosa ;-)
    // si callback es una funcion, entonces se llama con la ubicacion
    // encontrada como parámetro.

    var BUNKER = [-38.925492, -68.050953];
    var ubicacion;

    if (typeof(localStorage.lat) !== "undefined" && typeof(localStorage.lng) !== "undefined"){
        ubicacion = [localStorage.lat, localStorage.lng];
    }else{
        console.log("navigator");
        if ( navigator.geolocation ) {
            function success(pos) {
                // Location found
                console.log("navigator success");
                ubicacion = [pos.coords.latitude, pos.coords.longitude];
                _finally();
            }
            function fail(error) {
                console.log("navigator fail");
                ubicacion = BUNKER;
                _finally();
            }

            function _finally() {
                if (callback && typeof(callback) === "function") {
                    console.log(ubicacion);
                    callback(ubicacion);
                }
                return ubicacion;
            }

            return navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000,
                                                                     enableHighAccuracy:true,
                                                                     timeout: 7000});
        } else {
            console.log("no navigator");
        }
    }
}



var mostrar_productos = function(status, response, selector) {
    var $ul = selector,
    html = '';

    if (response.count > 0){
        $.each(response.results, function (i, obj) {
            html += '<li><a href="#producto" data-id="'+obj.id+'" class="producto">' +
                    '<h2>' + obj.descripcion + '</h2>' +
                    '<p><i class="fa fa-barcode"></i> ' + obj.upc + '</p>' +
                    '</a></li>';
        });
    }
    else {
        html = '<li><a class="ui-btn ui-shadow ui-corner-all ui-icon-alert ui-btn-icon-left">No se encontraron resultados</a></li>';
    }

    $ul.html(html);
    $ul.listview('refresh');
    $ul.trigger('updatelayout');
}

var guardar_precio = function(precio)
{
    var fecha = new Date();
    var data = {
        precio: precio,
        fecha: fecha.toJSON(),
        pid: localStorage.producto_id,
        sid: localStorage.sucursal_id
    }

    precios_queue.put(data);
    setTimeout(enviar_precios, 3000);
    // - Manejo de interfaz
    $('#votar_precio').popup('close');
    $('#precio_preguntar').hide();
    $('#precio_agradecer').show();
    $('#precio_votar_form input[name=precio]').val('');
}


var enviar_precios = function (){
    console.log('Mandando precios');

    var index = precios_queue.qsize();

    while(index) {
        e = precios_queue.get();

        var url = BASE_API_URL + '/sucursales/' + e.sid + '/productos/' + e.pid;
        $.ajax({
            async: false,
            global: false,
            type: 'POST',
            dataType: 'json',
            url: url,
            data: {precio: e.precio, created: e.fecha},
            error: function(response) {
                precios_queue.put(e);
            }
        });

        index--;
    }

    if (precios_queue.qsize() > 0){
        setTimeout(enviar_precios, 5000);
    }
}

// ---

$(document).ajaxStart(function () {
    $.mobile.loading('show');
});
$(document).ajaxStop(function () {
    $.mobile.loading('hide');
});

$(document).on("pageshow", "#principal", function() {

    console.log("show principal")
    get_ubicacion(function(ubicacion) {
        console.log("ubicacion recibida" + ubicacion);

        consultar_sucursales(
            mostrar_sucursales,
            {
                selector: $('#sucursales_cercanas_listview'),
                lat: ubicacion[0],
                lon: ubicacion[1],
                limite: 3
            }
        );

    });


    $("#sucursales_listview").on("filterablebeforefilter", function (e, data) {
        var $ul = $( this ),
            $input = $( data.input ),
            value = $input.val(),
            html = '';

        $ul.html('');
        if (value && value.length > 2) {
            $ul.html( '<li><div class="ui-loader"><span class="ui-icon ui-icon-loading"></span></div></li>');
            $ul.listview('refresh');

            consultar_sucursales(
                mostrar_sucursales,
                {
                    selector: $ul,
                    q: $input.val()
                }
            );
        }
    });
});

$(document).on("pagecreate", "#sucursal", function() {
    $("#productos_listview").on("filterablebeforefilter", function (e, data) {
        var $ul = $( this ),
            $input = $( data.input ),
            value = $input.val(),
            html = '';

        $ul.html('');
        if (value && value.length > 2) {
            $ul.html('<li><div class="ui-loader"><span class="ui-icon ui-icon-loading"></span></div></li>');
            $ul.listview('refresh');

            consultar_productos(
                mostrar_productos,
                {
                    selector: $ul,
                    q: $input.val()
                }
            )
        }
    });
});

$(document).on("pagebeforeshow", "#producto", function() {
    $('#producto_nombre').html('');
    $('#producto_upc').html('');
    $('#producto_precio').html('');
    $('#producto_foto').attr('src', 'images/logo.png');
    $('#mejores_precios').html('');
});

$(document).on("pageshow", "#producto", function() {
    $('#precio_preguntar').show();
    $('#precio_agradecer').hide();

    $.ajax({
        url: BASE_API_URL + '/sucursales/' + localStorage.sucursal_id + '/productos/' + localStorage.producto_id,
        dataType: "json",
        crossDomain: true,
        data: {
            format: 'json',
        },
        error: function(xhr, text, error) {
            $('#producto_nombre').html('No se pudo obtener la información solicitada');
        },
        success: function(response) {
            $('#producto_nombre').html(response.producto.descripcion);
            $('#producto_upc').html(response.producto.upc);
            if (response.producto.foto !== null) {
                $('#producto_foto').attr('src', BASE_IMG_URL + response.producto.foto);
            }

            if (response.mas_probables.length > 0) {
                $('#producto_precio').html('$' + response.mas_probables[0].precio + '.-');
                $('#votar_precio_si').data('precio', response.mas_probables[0].precio / 1);
            }
            else {
                $('#producto_precio').html('Sin precio');
                $('#votar_precio_si').data('precio', 0);
            }

            if (response.mejores.length > 0) {
                response.mejores.forEach(function (e, index) {
                    $('#mejores_precios').append('<li>$'+e.precio+'.- en '+e.sucursal.nombre+'</li>');
                });
            }
            else {
                $('#mejores_precios').html('<li>No hay precios sugeridos</li>');
            }
        },
    });
});

// ---

var asignar_sucursal_id = function(e){
    var target = $(e.target);
    var sucursal_id = null;

    if (target.is('a')) {
        sucursal_id = $(e.target).data('id');
    }
    else {
        sucursal_id = $(e.target).closest('a').data('id');
    }

    localStorage.sucursal_id = sucursal_id;
    console.log({sucursal_id: localStorage.sucursal_id});
};
var asignar_producto_id = function(e){
    var target = $(e.target);
    var producto_id = null;

    if (target.is('a')) {
        producto_id = $(e.target).data('id');
    }
    else {
        producto_id = $(e.target).closest('a').data('id');
    }

    localStorage.producto_id = producto_id;
    console.log({producto_id: localStorage.producto_id});
};


$(document).on('pageinit', '#principal', function(){
    $(document).on('click', 'a.sucursal', asignar_sucursal_id);
});
$(document).on('pageinit', '#sucursal', function(){
    $(document).on('click', 'a.producto', asignar_producto_id);
});
$(document).on('pageinit', '#producto', function(){
    $('#votar_precio_si').click(function(e) {
        var precio = $(e.target).data('precio');

        if (precio > 0) {
            guardar_precio(precio);
        }
        else {
            $('#votar_precio').popup('open', {transition: "pop"});
        }
    });

    $('#precio_votar_form').submit(function(e) {
        e.preventDefault();

        var precio = ($('#precio_votar_form input[name=precio]').val() / 1);
        guardar_precio(precio);

    });
});
$(document).on('pageinit', '#ubicacion', function(){

    get_ubicacion(function(ubicacion) {

        alert([localStorage.lng, localStorage.lat]);

        var point = new google.maps.LatLng(ubicacion[0], ubicacion[1]);

        function drawMap(latlng) {
            var myOptions = {
                zoom: 15,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(document.getElementById("map-canvas"), myOptions);
            // Add an overlay to the map of current lat/lng
            var marker = new google.maps.Marker({
                map: map,
                position: latlng
            });

            function placeMarker(location) {
                marker.setPosition(location);
                // actualizamos el localstorage
                localStorage.lng = location.lng();
                localStorage.lat = location.lat();
            }

            // pero se actualiza donde el usuario hace click.
            google.maps.event.addListener(map, 'click', function(event) {
              placeMarker(event.latLng);
            });
        }
        drawMap(point);

    });

});
