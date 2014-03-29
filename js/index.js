/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var PRECIOSA_CLIENT_VERSION = "0.1dev (Natimit)";
var init = null;

var app = {
    // Application Constructor
    initialize: function() {
        if (init !== null) {
            return;
        }
        this.bindEvents();
        if (localStorage.sucursales_recientes === undefined || localStorage.sucursales_recientes == ""){
           localStorage.sucursales_recientes = JSON.stringify([]);
        }

        if(window.location.hash) {
            var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
            console.debug(hash);
            setTimeout(function(){
                $('a[href="#' + hash + '"]').trigger('click');
            }, 200);
        }

        try{
            device;
        } catch(err){
            // mock. se pide via prompt.
            window.device = device_mock;
        }

        $.ajaxSetup({
              headers: {'Authorization': "Token " + app.get_token()}
        });

        // clean up de la ultima sesión.
        localStorage.removeItem('lat');
        localStorage.removeItem('lng');

        init = 'inicializado';
    },


    get_token: function(){

        if (localStorage.preciosa_token !== undefined) {
            return localStorage.preciosa_token;
        }


        $.ajax({
            type: 'POST',
            dataType: 'json',
            url: API_URL + "/auth/registro",
            async: false,
            data: {uuid: device.uuid,
                   nombre: device.name,
                   plataforma: device.platform,
                   phonegap: device.phonegap,
                   plataforma_version: device.version,
                   preciosa_version: PRECIOSA_CLIENT_VERSION,
                },
            error: function(response) {
                console.log("error obteniendo token" + response);
                alert('Ha ocurrido un problema iniciando Preciosa. ' +
                      'Por favor vuelva a intentarlo en unos minutos.');
                return false;
            },
            success: function(response) {
                localStorage.preciosa_token = response.token;
            }
        })
        // TO DO: esto huele a mierda bloqueante. Preguntarle a
        // alguien que sepa cómo se hace bien.
        while (localStorage.preciosa_token === undefined){
            return get_token();
        }
        return localStorage.preciosa_token;
    },


    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // `load`, `deviceready`, `offline`, and `online`.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.getElementById('scan').addEventListener('click', this.scan, false);
    },

    // deviceready Event Handler
    //
    // The scope of `this` is the event. In order to call the `receivedEvent`
    // function, we must explicity call `app.receivedEvent(...);`
    onDeviceReady: function() {
        app.receivedEvent('deviceready');

    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    scan: function() {

        try{
            var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        } catch(err){
            // mock. se pide via prompt.
            var scanner = scanner_mock;
        }

        var codigo = '';

        scanner.scan(function(result) {
                        if (result.cancelled !== true) {
                            app.buscar(result.text);
                        }
                    }, function (error) {
                        console.log("Scanning failed: ", error);
                    }
        );
    },

    buscar: function(codigo){
        // como tenemos productos con y sin checksum, por las dudas
        // se lo quitamos para la búsqueda
        codigo = codigo.substring(0, codigo.length - 1);

        var $search = $('input[data-type="search"]', '#sucursal');
        $search.val(codigo);

        // debugger;
       // volvemos a la solapa de busqueda
        setTimeout(function(){
            $('a[href="#productos_buscar"]').trigger('click');
        },200);

        $search.trigger('change');
        $search.focus();
    }

};

var scanner_mock = {

    scan: function(callback_success, callback_error){

        var codigo = window.prompt("Ingresa el codigo","7794");
        if (codigo !== 'error'){
            result = {text: codigo, cancelled: false};
            callback_success(result);
        } else {
            callback_error("Error en el scanner");
        }
    }
}


var device_mock = {
    uuid: "test_uuid",
    name: "test_name",
    platform: "test_platform",
    phonegap: "test_phonegap",
    version: "test_version"
}

app.initialize();

