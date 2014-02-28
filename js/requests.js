$(document).on("pagecreate", "#principal", function() {
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
            .then(function(data) {
                if (data.count > 0){
                    $.each(data.results, function (i, obj) {
                        html += '<li><a href="#sucursal?id=' + obj.id + '">' + obj.nombre + '</a></li>';
                    });

                    $ul.html( html );
                    $ul.listview( "refresh" );
                    $ul.trigger( "updatelayout");
                }
                else {
                    alert("No hay resultados :(");
                }
            });
        }
    });
});
