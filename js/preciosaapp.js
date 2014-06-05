function PreciosaApp() {
    this.api = new PreciosaApi(BASE_URL, API_URL);
}

PreciosaApp.prototype.mostrarError = function(opciones) {
    $elemento = opciones.selector;
    var html = opciones.error;
    $elemento.html(html);
};


PreciosaApp.prototype.actualizarListview = function(html, $ul) {
    $ul.html(html);
    $ul.listview('refresh');
    $ul.trigger('updatelayout');
};


PreciosaApp.prototype.asignarSucursalId = function(e, elem) {
    var target = $(e.target);
    var sucursalId = null;
    var sucursalName = null;
    if (target.is('a')) {
        sucursalId = $(e.target).data('id');
        sucursalName = $("h2", $(e.target)).text();
    }
    else {
        sucursalId = $(e.target).closest('a').data('id');
        sucursalName = $("h2", $(e.target).closest('a')).text();
    }
    conf.setSucursalId(sucursalId);
    conf.setSucursalName(sucursalName);
    this.actualizarRecientes(sucursalId, $(elem).parents('li'));
};


PreciosaApp.prototype.asignarProductoId = function(e) {
    var target = $(e.target);
    var producto_id = null;

    if (target.is('a')) {
        producto_id = $(e.target).data('id');
    }
    else {
        producto_id = $(e.target).closest('a').data('id');
    }

    localStorage.producto_id = producto_id;
};


PreciosaApp.prototype.actualizarRecientes = function(sucursal_id, $li) {
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

    recientesOriginal = pack_objects(recientes);

    // queda ordenada y hasta 5.
    recientesOriginal.sort(compare);
    localStorage.sucursales_recientes = JSON.stringify(recientesOriginal.slice(0, 5));
};

PreciosaApp.prototype.mostrarSucursales = function(status, response, selector) {
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
    this.actualizarListview(html, $ul);
};


PreciosaApp.prototype.mostrarProductos = function(status, response, selector) {
    var $ul = selector,
    html = '';
    if (response.count > 0) {
        var href = "producto.html#producto";
        if (localStorage.readMode === "true") {
            href = "producto.html#producto_read";
        }
        $.each(response.results, function (i, obj) {
            html += '<li><a href="'+ href +'" data-ajax="false" data-id="'+obj.id+'" class="producto">' +
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


PreciosaApp.prototype.guardarPrecio = function(precio) {
    this.api.savePrecio(precio, function() {
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
        $('.mejores_precios').fadeIn();
    });
};


PreciosaApp.prototype.sucursalesCercanas = function() {
    console.log('cercanas');
    var that = this;
    $(".cercana_coor").text(conf.placeName);
    function mostrarSucursalesTmp(status, response, selector) {
        that.mostrarSucursales(status, response, selector);
    }

    function obtieneUbicacion(ubicacion) {
        that.api.getSucursales(
            mostrarSucursalesTmp,
            {
                selector: $('#sucursales_cercanas_listview'),
                lat: ubicacion.lat,
                lon: ubicacion.lng,
                radio: conf.radio,
                limite: 5
            }
        );
    }

    function fallaObtenerUbicacion(error) {
        that.mostrarError({selector: $("#sucursales_cercanas_listview"), error: error.error});
    }
    var location = new Location();
    location.getLocation(obtieneUbicacion, fallaObtenerUbicacion);
};


PreciosaApp.prototype.initConfGeneral = function() {
    $("#precio_dias_input").val(conf.days);
    $("#precio_radio_input").val(conf.radio);

    //guardar en objeto global conf.
    $("#configuracion-general-form").on("submit", function(e) {
        e.preventDefault();
        //gyardamos la conf.
        conf.setDays($("#precio_dias_input").val());
        conf.setRadio($("#precio_radio_input").val());
        //volvemos a la pagina anterior de donde llamamos a la configuracion
        $.mobile.back();
        return false;
    });
};


PreciosaApp.prototype.initConfUbicacion = function() {
    var location = new Location();
    location.initMap('map_canvas');
    if (conf.placeName === undefined) {
        location.getLocation(function(pos) {
            location.geocode(pos.lat, pos.lng);
        }, function(error) {
            console.log("error al geolocalizar");
        });
    }

    //Campo autocompletado conectado con el mapa
    location.initMapSearchInput("ubicacion_input");
    //click en el mapa
    location.setMapEvents();

    //al guardar salvamos las coordenadas
    $("#configuracion-ubicacion-form button").on("click", function(e) {
        e.preventDefault();
        if($('#ubicacion_input').val()) {
            console.log("Guarda datos de localizacion");
            conf.setLat(localStorage.latTmp);
            conf.setLng(localStorage.lngTmp);
            conf.setPlaceName($('#ubicacion_input').val());
            $("#ubicacion-texto").text(conf.placeName);
        }

        $("div[data-role=footer]").css("visibility", "hidden");
        $.mobile.back();
        return false;
    });
};

PreciosaApp.prototype.createSupermarketMode = function() {
    //obtenemos recientes al hacer click en el tab
    var that = this;
    $('#tab_recientes').on("click", function() {
        console.log('recientes');
        var html = '';
        var recientes = JSON.parse(localStorage.sucursales_recientes);
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
        that.actualizarListview(html, $('#sucursales_recientes_listview'));
    });

    //cuando hacemos click en cercanas
    $("#tab_cercanas").on("click", function() {
        // cuando se solicita el tab "cercanas"
        // se consulta por geolocalizacion
        that.sucursalesCercanas();
    });

    function mostrarSucursalesTmp(status, response, selector) {
        that.mostrarSucursales(status, response, selector);
    }

    //??
    $("#sucursales_listview").on("filterablebeforefilter", function (e, data) {
        var $ul = $( this ),
            $input = $( data.input ),
            value = $input.val(),
            html = '';

        $ul.html('');
        if (value && value.length > 2) {
            $ul.html( '<li><div class="ui-loader"><span class="ui-icon ui-icon-loading"></span></div></li>');
            $ul.listview('refresh');

            that.api.getSucursales(
                mostrarSucursalesTmp,
                {
                    selector: $ul,
                    q: $input.val()
                }
            );
        }
    });

    // se carga la última busqueda realizada.
    if (localStorage.ultima_busqueda !== undefined){
        this.actualizarListview(localStorage.ultima_busqueda, $('#sucursales_listview'));
    }
};


PreciosaApp.prototype.showSupermarketMode = function() {
    var that = this;
    if($("#tab_cercanas").parent().hasClass('ui-tabs-active')) {
        that.sucursalesCercanas();
    }
};


PreciosaApp.prototype.createSucursal = function() {
    var that = this;
    $("#productos_listview").on("filterablebeforefilter", function (e, data) {
        var $ul = $( this ),
            $input = $( data.input ),
            value = $input.val(),
            html = '';

        $ul.html('');
        if (value && value.length > 2) {
            $ul.html('<li><div class="ui-loader"><span class="ui-icon ui-icon-loading"></span></div></li>');
            $ul.listview('refresh');

            that.api.getProductos(
                that.mostrarProductos,
                {
                    selector: $ul,
                    q: $input.val()
                }
            );
        }
    });
};


PreciosaApp.prototype.showSucursal = function() {
    if(localStorage.readMode === "true") {
        $(".cercana_coor_prod").text(conf.placeName);
    } else {
        $(".cercana_coor_prod").text(conf.sucursalName);
    }

    $("#prod_conf_hubicacion").off("click");
    $("#prod_conf_hubicacion").on("click", function(e) {
        e.preventDefault();
        if(localStorage.readMode === "true") {
            $.mobile.changePage("#configuracion", "none");
         } else {
            $.mobile.changePage("#supermercado", "none");
        }
        return false;
    });

    var $ul = $("#productos_listview");
    var value = $("input", $ul.prev()).val();
    if (value && value.length > 2) {
        this.api.getProductos(
            this.mostrarProductos,
            {
                selector: $ul,
                q: value
            }
        );
    }


};


PreciosaApp.prototype.initProducto = function() {
    var that = this;
    $('#votar_precio_si').on('click', function(e) {
        var precio = $(e.target).data('precio');
        if (precio > 0) {
            that.guardarPrecio(precio);
        }
        else {
            $('#votar_precio').popup('open', {transition: "pop"});
        }
    });

    $('#precio_votar_form').submit(function(e) {
        e.preventDefault();
        var precio = ($('#precio_votar_form input[name=precio]').val() / 1);
        preciosa.guardarPrecio(precio);

    });
};


PreciosaApp.prototype.showProducto = function() {
    $('#precio_preguntar').show();
    $('#precio_agradecer').hide();
    var that = this;
    this.api.getProductoDetalle(function(response) {
        $('.producto_nombre').html(response.producto.descripcion);
        $('.producto_upc').html(response.producto.upc);
        if (response.producto.foto !== null) {
            $('#producto_foto').attr('src', BASE_URL + response.producto.foto);
        }

        if(localStorage.readMode !== "true") {
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
        }

        if (response.mejores.length > 0) {
            if(localStorage.readMode !== "true") {
                $('.mejores_precios').hide();
            }
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

                $('.mejores_precios').append(li);
            });
        }
        else {
            $('.mejores_precios').html('<li class="ui-li-static ui-body-inherit ui-first-child ui-last-child">No hay precios sugeridos</li>');
        }
    }, function(xhr, text, error) {
        $('.producto_nombre').html('No se pudo obtener la información solicitada');
    });
};


PreciosaApp.prototype.showPrincipal = function() {
    localStorage.readMode = false;
    $("#to-read-mode").off("click");
    $("#to-read-mode").on("click", function(e) {
        localStorage.readMode = true;
    });
};