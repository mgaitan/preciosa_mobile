$(document).on("pagecreate", "#principal", function() {

    var test = function() {
        var $ul = $("#sucursales_cercanas_listview"),
        html = "";

        console.log($ul);
        $.ajax({
            url: "http://localhost:8000/api/v1/sucursales/",
            dataType: "jsonp",
            crossDomain: true,
            data: {
                lat: -38.7316685,
                lon: -62.251555,
                limit: 3
            }
        })
        .then(function(response) {
            console.log(response);
            if (response.count > 0){
                $.each(response.results, function (i, obj) {
                    html += '<li><a href="?id=' + obj.id + '/#sucursal">' + obj.nombre + '</a></li>';
                });
            }
            else {
                html = '<li><a class="ui-btn ui-shadow ui-corner-all ui-icon-alert ui-btn-icon-left">No se encontraron resultados</a></li>';
            }

            $ul.html( html );
            $ul.listview( "refresh" );
            $ul.trigger( "updatelayout");
        });
    }
    test();

    // --

    $("#sucursales_listview").on("filterablebeforefilter", function (e, data) {
        var $ul = $( this ),
            $input = $( data.input ),
            value = $input.val(),
            html = "";

        $ul.html( "" );
        if (value && value.length > 2) {
            $ul.html( "<li><div class='ui-loader'><span class='ui-icon ui-icon-loading'></span></div></li>" );
            $ul.listview( "refresh" );

            $.ajax({
                url: "http://localhost:8000/api/v1/sucursales/",
                dataType: "jsonp",
                crossDomain: true,
                data: {
                    q: $input.val()
                }
            })
            .then(function(response) {
                if (response.count > 0){
                    $.each(response.results, function (i, obj) {
                        html += '<li><a href="?id=' + obj.id + '/#sucursal">' + obj.nombre + '</a></li>';
                    });
                }
                else {
                    html = '<li><a class="ui-btn ui-shadow ui-corner-all ui-icon-alert ui-btn-icon-left">No se encontraron resultados</a></li>';
                }

                $ul.html( html );
                $ul.listview( "refresh" );
                $ul.trigger( "updatelayout");
            });
        }
    });
});
