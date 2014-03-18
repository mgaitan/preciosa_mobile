/* Este es el modulo js cliente de la API rest */

var BASE_API_URL = "http://preciosdeargentina.com.ar/api/v1";
var BASE_IMG_URL = "http://preciosdeargentina.com.ar";

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

    var BUNKER = [-31.4428, -64.1797];
    var ubicacion = BUNKER;

    if (typeof(localStorage.lat) !== "undefined" && typeof(localStorage.lng) !== "undefined"){
        ubicacion = [localStorage.lat, localStorage.lng];
    }else{
        console.log("navigator");
        if ( navigator.geolocation ) {
            function success(pos) {
                // Location found
                console.log("navigator success");
                ubicacion = [pos.coords.latitude, pos.coords.longitude];
            }
            function fail(error) {
                console.log("navigator fail");
            }
            // Find the users current position.
            // Cache the location for 5 minutes,
            // timeout after 6 seconds
            navigator.geolocation.getCurrentPosition(success, fail, {maximumAge: 500000,
                                                                     enableHighAccuracy:true,
                                                                     timeout: 6000});
        } else {
            console.log("no navigator");
        }
    }
    if (callback && typeof(callback) === "function") {
        callback(ubicacion);
    }
    return ubicacion;
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
    var precios_list = JSON.parse(localStorage.precios);

    var data = 'precio=' + precio;
    var fecha = new Date();

    data = data + '&producto_id=' + localStorage.producto_id;
    data = data + '&sucursal_id=' + localStorage.sucursal_id;
    data = data + '&fecha=' + fecha.toJSON();

    precios_list.push(data);
    localStorage.precios = JSON.stringify(precios_list);

    $('#votar_precio').popup('close');
    $('#precio_preguntar').hide();
    $('#precio_agradecer').show();
    $('#precio_votar_form input[name=precio]').val('');
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
    if (typeof(localStorage.precios) === 'undefined') {
        localStorage.precios = JSON.stringify([]);
    }

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

    //localStorage.removeItem('lat');
    //localStorage.removeItem('lng');

    var ubicacion = get_ubicacion();

    var point = new google.maps.LatLng(ubicacion[0], ubicacion[1]);

    drawMap(point);

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
});
