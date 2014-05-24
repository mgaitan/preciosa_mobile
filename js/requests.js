/* Este es el modulo js cliente de la API rest */

//var BASE_URL = "http://107.170.28.160";
var BASE_URL = "http://preciosdeargentina.com.ar";
var API_URL = BASE_URL + "/api/v1";


// buffer para enviar precios asincronicamente
var precios_queue = new Queue('precios');


// token para evitar peticiones concurrentes.
var peticion_ajax = null;


var consultar_sucursales = function(callback, params) {
    if (typeof(params) === 'undefined') params = {};

    var data = {
        format: 'json',
    };

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

    if (peticion_ajax !== null) { peticion_ajax.abort(); }

    peticion_ajax = $.ajax({
        url: API_URL + "/sucursales/",
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

var consultar_productos = function(callback, params) {
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

var mostrar_error = function(opciones) {
    $elemento = opciones.selector;
    var html = opciones.error;
    $elemento.html(html);
};

var mostrar_sucursales = function(status, response, selector) {
    var $ul = selector,
    html = '';

    if (response.count > 0){
        $.each(response.results, function (i, e) {
            html += '<li><a href="#sucursal" data-id="'+e.id+'" class="sucursal">';

            if (e.cadena_completa) {
                html += '<h2>'+e.cadena_completa.nombre+' ('+e.nombre+')</h2>';
            }
            else {
                html += '<h2>'+e.nombre+'</h2>';
            }

            html += '<p><i class="fa fa-location-arrow"></i> '+e.direccion+', ' +e.ciudad_nombre+'</p>' +
                    '</a></li>';
        });
    }
    else {
        html = '<li><a class="ui-btn ui-shadow ui-corner-all ui-icon-alert ui-btn-icon-left">No se encontraron resultados</a>';
        html += '<p style="padding:0.5em; white-space:normal;">Podés agregar nuevas sucursales desde la web <strong>preciosdeargentina.com.ar</strong></p></li>';
    }

    if ($ul.attr('id') === 'sucursales_listview'){
        // para una busqueda se cachean los resultados.
        localStorage.ultima_busqueda = html;
    }
    actualizar_listview(html, $ul);
};

var actualizar_listview = function(html, $ul){
    $ul.html(html);
    $ul.listview('refresh');
    $ul.trigger('updatelayout');
};


var get_ubicacion = function(success_callback, error_callback) {
    // Devuelve la ubicacion guardada en localStorage,
    // o la del navigator.

    // La función espera dos funciones, una para llamar cuando
    // se obtiene correctamente una locación y otro callback
    // para llamar en caso de error.

    if (localStorage.lat !== undefined  && localStorage.lng !== undefined) {
        console.log("Recuperando latitud y longitud desde localStorage.");

        var ubicacion = {lat: localStorage.lat, lng: localStorage.lng};
        success_callback(ubicacion);

    } else {


        if (!navigator.geolocation) {
            error_callback({error: "El navegador no soporta geo-posicionamiento."});
            return;
        }

        function success(pos) {
            ubicacion = [pos.coords.latitude, pos.coords.longitude];
            var ubicacion = {lat: pos.coords.latitude, lng: pos.coords.longitude};

            localStorage.lat = ubicacion.lat;
            localStorage.lng = ubicacion.lng;

            success_callback(ubicacion);
        }

        function fail(error) {
            error_callback({error: "No se pudo conseguir la ubicacion del equipo (motivo: " + error.message + ")"});
        }

        var options = { //enableHighAccuracy:true,
                       timeout: 15000};

        navigator.geolocation.getCurrentPosition(success, fail, options);
    }
};



var mostrar_productos = function(status, response, selector) {
    var $ul = selector,
    html = '';

    if (response.count > 0){
        $.each(response.results, function (i, obj) {
            html += '<li><a href="producto.html#producto" data-ajax="false" data-id="'+obj.id+'" class="producto">' +
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
};

var guardar_precio = function(precio){
    var fecha = new Date();
    var data = {
        precio: precio,
        fecha: fecha.toJSON(),
        pid: localStorage.producto_id,
        sid: localStorage.sucursal_id
    };

    precios_queue.put(data);

    // - Manejo de interfaz
    $('#votar_precio').popup('close');
    $('#precio_preguntar').hide();
    $('#producto_precio').fadeOut('slow', function(){
            $(this).html('$' + precio.toFixed(2));
            $(this).fadeIn('slow', function(){
                $('#precio_agradecer').show().delay(5000).fadeOut();
            });
    });
    $('#precio_votar_form input[name=precio]').val('');
    $('#no_seas_leecher').hide();
    $('#mejores_precios').fadeIn();
    setTimeout(enviar_precios, 500);
};


var enviar_precios = function (){
    var index = precios_queue.qsize();
    var en_verde = true;

    while(index) {
        index--;
        if (en_verde) {
            en_verde = false;

            e = precios_queue.get();
            var url = API_URL + '/sucursales/' + e.sid + '/productos/' + e.pid;

            $.ajax({
                global: false,
                type: 'POST',
                dataType: 'json',
                url: url,
                data: {precio: e.precio, created: e.fecha},
                error: function(response) {
                    console.log("error" + response);
                    precios_queue.put(e);
                },
                complete: function(response) {
                    en_verde = true;
                }
            });
        }
    }

    setTimeout(enviar_precios, 3000);
};


$(document).ajaxStart(function () {
    $.mobile.loading('show');
});
$(document).ajaxStop(function () {
    $.mobile.loading('hide');
});



$(document).on("pagecreate", "#principal", function() {

    $('#tab_recientes').on("click", function(){

        console.log('recientes');
        var html = '';

        var recientes = JSON.parse(localStorage.sucursales_recientes);
        console.log(recientes);
        $.each(recientes, function (e) {
            if (this.html !== undefined){
                html += this.html;
            }
        });
        // si quedó vacío, ponemos cartelito.
        if (html === ''){
            html = '<li><a class="ui-btn ui-shadow ui-corner-all ui-icon-alert ui-btn-icon-left">No hay sucursales recientes</a></li>';
        }

        // para test en el movil
        // console.log('### CLASSES' + $('a:first', $('<div></div>').append(html)).attr('class'));

        actualizar_listview(html, $('#sucursales_recientes_listview'));
    });



    $("#tab_cercanas").on("click", function() {
        // cuando se solicita el tab "cercanas"
        // se consulta por geolocalizacion
        console.log('cercanas');
        function cuando_obtiene_ubicacion(ubicacion) {
            consultar_sucursales(
                mostrar_sucursales,
                {
                    selector: $('#sucursales_cercanas_listview'),
                    lat: ubicacion.lat,
                    lon: ubicacion.lng,
                    radio: 15,
                    limite: 5
                }
            );
        }

        function cuando_falla_obtener_ubicacion(error) {
            mostrar_error({selector: $("#sucursales_cercanas_listview"), error: error.error});
        }

        get_ubicacion(cuando_obtiene_ubicacion, cuando_falla_obtener_ubicacion);
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

    // se carga la última busqueda realizada.
    if (localStorage.ultima_busqueda !== undefined){
        actualizar_listview(localStorage.ultima_busqueda, $('#sucursales_listview'));
    }

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
            );
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

    // reset de una vista previa
    $('#precio_preguntar').show();
    $('#precio_agradecer').hide();

    if (peticion_ajax !== null) { peticion_ajax.abort(); }

    peticion_ajax = $.ajax({
        url: API_URL + '/sucursales/' + localStorage.sucursal_id + '/productos/' + localStorage.producto_id,
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
                $('#producto_foto').attr('src', BASE_URL + response.producto.foto);
            }

            if (response.mas_probables.length > 0) {
                $('#producto_precio').html('$' + response.mas_probables[0].precio);
                $('#votar_precio_si').data('precio', response.mas_probables[0].precio / 1);
            }
            else {
                $('#producto_precio').html('Sin precio');
                $('#votar_precio_si').data('precio', 0);

                // si no hay precio para la sucursal, se pide automáticamente
                setTimeout(function(){
                    $('#votar_precio').popup('open', {transition: "pop"});
                }, 300);

            }

            if (response.mejores.length > 0) {
                $('#mejores_precios').hide();
                $('#no_seas_leecher').attr('style', '').fadeIn();
                response.mejores.forEach(function (e, index) {
                    var extra_class = '';
                    var cadena = '';
                    if (index===0){
                        extra_class += ' ui-first-child';
                    }
                    if(index === response.mejores.length - 1){
                        extra_class = ' ui-last-child';
                    }
                    if (e.sucursal.cadena_completa){
                        cadena = e.sucursal.cadena_completa.nombre + ' ';
                    }


                    var li = '<li class="ui-li-static ui-body-inherit ui-li-has-count ';
                       li += extra_class + '"><h4>' + cadena + e.sucursal.nombre + '</h4> ';
                       li += '<span class="ui-li-count ui-body-inherit" style="font-size:1.3em">$ ';
                       li += e.precio + '</span> <p>' + e.sucursal.direccion + ' - ' + e.sucursal.ciudad_nombre;
                       li += '</p></li>';

                    $('#mejores_precios').append(li);
                });
            }
            else {
                $('#mejores_precios').html('<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">No hay precios sugeridos</li>');
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

    actualizar_recientes(sucursal_id, $(this).parents('li'));

};

var actualizar_recientes = function(sucursal_id, $li){
    // cuando se asigna una sucursal, se actualiza el contador asociado
    // para que aparezca en "recientes"
    // ordena de mas visitadas a menos visitadas y deja las 5 más visitadas

    function compare(a,b) {
      if (a.contador > b.contador || a === null)
         return -1;
      if (a.contador < b.contador || b === null)
        return 1;
      // a igual contador, primero el más reciente
      if (a.ultima_vez > b.ultima_vez)
        return -1;
      if (a.ultima_vez < b.ultima_vez)
        return 1;
      return 0;
    }


    function unpack_objects(map){
        var r = {};
        $.each(map, function(i,e){

            if (e !== null)
                r[e.id] = e;
        });
        return r;
    }


    function pack_objects(hash){
        var r = [];
        $.each(hash, function(e){
                r.push(hash[e]);
        });
        return r;
    }

    console.log(localStorage.sucursales_recientes);

    // [{id: XX, html: 'zzz', contador: YY}, { id: ZZ...}, null]
    var recientes_original = JSON.parse(localStorage.sucursales_recientes);


    // { XX: {id: XX, html: 'zzz', contador: YY}, ZZ: {id: ZZ ...}}
    var recientes = unpack_objects(recientes_original);


    // en el telefono quedan azules debido a que al hacer
    // click se agrega la clase ui-btn-active. lo quitamos
    // para el caché.
    $('a', $li).removeClass("ui-btn-active");

    // cómo se hace para obtener el html incluyendo el contenedor?
    var html = '<li>' + $li.html() + '</li>';

    if (recientes[sucursal_id] !== undefined){
        recientes[sucursal_id].contador += 1;
        recientes[sucursal_id].html = html;
        recientes[sucursal_id].ultima_vez = Date.now();
    } else {
        recientes[sucursal_id] = {'contador': 1,
                                  'html': html,
                                  'id': sucursal_id,
                                  'ultima_vez': Date.now()};
    }

    recientes_original = pack_objects(recientes);

    // queda ordenada y hasta 5.
    recientes_original.sort(compare);
    console.log(recientes_original);
    localStorage.sucursales_recientes = JSON.stringify(recientes_original.slice(0, 5));
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

    $('#votar_precio_si').on('click', function(e) {
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

    function cuando_obtiene_ubicacion(ubicacion) {
        console.log(ubicacion);
        var point = new google.maps.LatLng(ubicacion.lat, ubicacion.lng);

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
    }

    function cuando_falla_obtener_ubicacion(error) {
        console.log("No se pudo obtener la locación (" + error.error + ").");
    }

    get_ubicacion(cuando_obtiene_ubicacion, cuando_falla_obtener_ubicacion);

});
