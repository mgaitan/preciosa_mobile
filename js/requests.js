/* Este es el modulo js cliente de la API rest */

var BASE_URL = "http://localhost:8000/api/v1";
var BASE_URL = "http://preciosdeargentina.com.ar/api/v1";

var consultar_sucursales = function(callback, params) {
    if (typeof(params) === 'undefined') params = {};

    var data = {
        format: 'json',
    }

    if (typeof(params.lat) !== 'undefined' && typeof(params.lon) !== 'undefined') {
        data.lat = params.lat;
        data.lon = params.lon;
    }

    if (typeof(params.limit) !== 'undefined') {
        data.limit = params.limit;
    }

    if (typeof(params.q) !== 'undefined') {
        data.q = params.q;
    }

    $.ajax({
        url: BASE_URL + "/sucursales/",
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
        url: BASE_URL + "/productos/",
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
            html += '<li><a href="#sucursal" data-id="'+obj.id+'" class="sucursal">' + obj.nombre + '</a></li>';
        });
    }
    else {
        html = '<li><a class="ui-btn ui-shadow ui-corner-all ui-icon-alert ui-btn-icon-left">No se encontraron resultados</a></li>';
    }

    $ul.html(html);
    $ul.listview('refresh');
    $ul.trigger('updatelayout');
};

var mostrar_productos = function(status, response, selector) {
    var $ul = selector,
    html = '';

    if (response.count > 0){
        $.each(response.results, function (i, obj) {
            html += '<li><a href="#producto" data-id="'+obj.id+'" class="producto"><h2>' + obj.descripcion + '</h2><p><i class="fa fa-barcode"></i> ' + obj.upc + '</p></a></li>';
        });
    }
    else {
        html = '<li><a class="ui-btn ui-shadow ui-corner-all ui-icon-alert ui-btn-icon-left">No se encontraron resultados</a></li>';
    }

    $ul.html(html);
    $ul.listview('refresh');
    $ul.trigger('updatelayout');
}

// ---

$(document).on("pagecreate", "#principal", function() {
    consultar_sucursales(
        mostrar_sucursales,
        {
            selector: $('#sucursales_cercanas_listview'),
            lat: -38.7316685,
            lon: -62.251555,
            limit: 3
        }
    );

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
    console.log(localStorage);
    $.ajax({
        url: BASE_URL + "/productos/",
        dataType: "json",
        crossDomain: true,
        data: {
            format: 'json',
            pk: localStorage.producto_id
        },
        error: function(xhr, text, error) {
            $('#producto_nombre').html('No se pudo obtener el precio');
        },
        success: function(response) {
            if (response.count > 0) {
                $('#producto_nombre').html(response.results[0].descripcion);
            }
        },
    });

    $.ajax({
        url: BASE_URL + "/precios/",
        dataType: "json",
        crossDomain: true,
        data: {
            format: 'json',
            producto_id: localStorage.producto_id,
            sucursal_id: localStorage.sucursal_id
        },
        error: function(xhr, text, error) {
            $('#producto_precio').html('No se pudo obtener el precio');
        },
        success: function(response) {
            if (response.count > 0) {
                $('#producto_precio').html('$' + response.results[0].precio + '.-');
            }
            else {
                $('#producto_precio').html('Sin precio');
            }
        },
    });
});

// ---

var asignar_sucursal_id = function(e){
    localStorage.sucursal_id = $(e.target).data('id');
    console.log({sucursal_id: localStorage.sucursal_id});
};
var asignar_producto_id = function(e){
    localStorage.producto_id = $(e.target).data('id');
    console.log({producto_id: localStorage.producto_id});
};


$(document).on('pageinit', '#principal', function(){
    $(document).on('click', 'a.sucursal', asignar_sucursal_id);
});
$(document).on('pageinit', '#sucursal', function(){
    $(document).on('click', 'a.producto', asignar_producto_id);
});
