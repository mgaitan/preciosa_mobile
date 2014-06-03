/* Este es el modulo js cliente de la API rest */

var BASE_URL = "http://107.170.28.160";
//var BASE_URL = "http://192.168.1.203:8000";
//var BASE_URL = "http://localhost:8000";
//var BASE_URL = "http://preciosdeargentina.com.ar";

var API_URL = BASE_URL + "/api/v1";

preciosa = new PreciosaApp();

// token para evitar peticiones concurrentes.
var peticion_ajax = null;

var maps_mark = null;

var conf = new Configuration();


//AQUI SOLO PONDREMOS LOS EVENTOS

$(document).ajaxStart(function () {
    $.mobile.loading('show');
});
$(document).ajaxStop(function () {
    $.mobile.loading('hide');
});


$(document).on("pagecreate", "#principal", function() {
    preciosa.createPrincipal();
});


$(document).on("pageshow", "#principal", function() {
    preciosa.showPrincipal();
});

$(document).on("pagecreate", "#sucursal", function() {
    preciosa.createSucursal();
});

$(document).on("pagebeforeshow", "#producto", function() {
    $('#producto_nombre').html('');
    $('#producto_upc').html('');
    $('#producto_precio').html('');
    $('#producto_foto').attr('src', 'images/logo.png');
    $('#mejores_precios').html('');
});

$(document).on("pageshow", "#producto", function() {
    preciosa.showProducto();
});

// ---
var asignar_sucursal_id = function(e){
    preciosa.asignarSucursalId(e, this);
};

var actualizar_recientes = function(sucursal_id, $li){
    preciosa.actualizarRecientes(sucursal_id, $li);
};

var asignar_producto_id = function(e) {
    preciosa.asignarProductoId(e);
};

$(document).on('pageinit', '#principal', function() {
    $(document).on('click', 'a.sucursal', asignar_sucursal_id);
});
$(document).on('pageinit', '#sucursal', function() {
    console.log("entraa");
    $(document).on('click', 'a.producto', asignar_producto_id);
});


$(document).on('pageinit', '#producto', function() {
    preciosa.initProducto();
});

// INICIALIZAMOs PAGINA DE CONFIGURACION
$(document).on("pagecreate", "#configuracion", function(data) {
    preciosa.initConfGeneral();
});

$(document).on("pageshow", "#configuracion", function(data) {
    //bug cuando el mapa se inicializa oculto, hay que resizear cuando se muestra.
    $('#conf-tabs').tabs({
        activate: function(event ,ui) {
            preciosa.initConfUbicacion();
        }
    });
    $("#conf-tab-ubicacion").trigger("click");
});