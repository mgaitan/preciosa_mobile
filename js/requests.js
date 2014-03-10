
var consultar_sucursales = function(callback, params) {
    if (typeof(params) === 'undefined') params = {};

    var data = {
        format: 'jsonp',
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
        url: "http://preciosdeargentina.com.ar/api/v1/sucursales/",
        dataType: "jsonp",
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
        format: 'jsonp',
    }

    if (typeof(params.barcode) !== 'undefined') {
        data.barcode = params.barcode;
    }

    if (typeof(params.q) !== 'undefined') {
        data.q = params.q;
    }

    $.ajax({
        url: "http://localhost:8000/api/v1/productos/",
        dataType: "jsonp",
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
            html += '<li><a href="#producto" data-id="'+obj.id+'" class="producto">' + obj.descripcion + ' <i>[' + obj.upc + ']</i></a></li>';
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
    //console.log(localStorage);
});

// ---

var asignar_sucursal_id = function(e){
    localStorage.sucursal_id = $(e.target).data('id');
    console.log(localStorage.sucursal_id);
};
var asignar_producto_id = function(e){
    localStorage.producto_id = $(e.target).data('id');
    console.log(localStorage.producto_id);
};


$(document).on('pagebeforeshow', '#principal', function(){
    $(document).on('click', 'a.sucursal', asignar_sucursal_id);
});
$(document).on('pagebeforehide', '#principal', function(){
    $(document).off('click', 'a.sucursal', asignar_sucursal_id);
});

$(document).on('pagebeforeshow', '#sucursal', function(){
    $(document).on('click', 'a.producto', asignar_producto_id);
});
$(document).on('pagebeforehide', '#sucursal', function(){
    $(document).off('click', 'a.producto', asignar_producto_id);
});
