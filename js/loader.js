$( document ).on( "mobileinit", function() {
    $.extend( $.mobile , {
        defaultPageTransition: 'slidefade',
    });

    $.mobile.loader.prototype.options.text = "Cargando ...";
    $.mobile.loader.prototype.options.textVisible = true;
    $.mobile.loader.prototype.options.textonly = false;
    $.mobile.loader.prototype.options.theme = "b";
    $.mobile.loader.prototype.options.html = "";
});
