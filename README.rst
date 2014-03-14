Preciosa Mobile
===============

Este es el repositorio de la aplicación mobile del proyecto Preciosa_

**Esta es la rama develop**, estructurada para  compilarse mediante `Phonegap Build`_. La rama local_develop_, en cambio, está pensada para utilizar Phonegap_ localmente.


Desarrollo
----------

Para configurar la URL de la API configura la variable javascript
``BASE_URL`` en ``js/requests.js`` con la url (sin slash). Por ejemplo:

.. code-block:: javascript

    var BASE_URL = "http://localhost:8000/api/v1";


Recursos
--------

- `Workflow de la app mobile <https://github.com/mgaitan/preciosa/wiki/Roadmap-sprint-para-la-version-0.1-%28primer-release%29>`_
- La `API v1 <http://preciosadeargentina.com.ar/api/v1>`_ de Preciosa


.. _Preciosa: http://github.com/mgaitan/preciosa
.. _Phonegap: http://www.phonegap.com/
.. _Phonegap Build: http://build.phonegap.com
.. _develop: https://github.com/mgaitan/preciosa_mobile/tree/local_develop