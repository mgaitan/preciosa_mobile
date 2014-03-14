Preciosa Mobile
===============

Este es el repositorio de la aplicación mobile del proyecto Preciosa_

**Esta es la rama ``local_develop``** que permite una compilación local del proyecto, con Phonegap_ y el/los SDK de las plataformas que quieras instalados en tu propia computadora.  La rama principal develop_, en cambio, está estructurada para  compilarse mediante `Phonegap Build`_


Sin embargo, el código de la aplicación (que en esta rama se encuentra en la carpeta ``/www``) es exáctamente el mismo que el de la raíz de la rama ``develop`` que sincronizamos utilizando `git-subtree`_

.. attention::

   **git-subtree** viene como *contrib* con Git 1.7.11 o posteriores.
   Si tenés una versión anterior, podés instalarlo manualmente (es un simple script bash):

   - bajalo_
   - renombrarlo como ``git-subtree``  (sin la extension ``.sh``)
   - dale permisos de ejecución y dejalo en una carpeta de tu ``PATH``
   - listo!


Como enviar tus aportes
------------------------

Si te interesa trabajar y compilar tus propios APK localmente mediante ``phonegap/cordova`` y luego querés contribuir tus cambios, debés
trabajar con el comando ``git-subtree``.

Los cambios que afectan a la aplicación en sí, es decir los que suceden dentro del directorio ``/www``, deben proponerse via un *pull request* desde una rama
independiente contra ``mgaitan/develop``. Por ejemplo, suponiento que tu repositorio (tu fork) remoto es ``origin`` y tenés todos tus cambios *commiteados*.


    git subtree push --prefix=www origin XX_feature_buenisimo

Eso te creará una rama ``XX_feature_buenisimo`` en tu repositorio (conteniendo sólo los commits que afectaron la carpeta ``www``) desde la que propondrás tu PR.

Actualizar desde ``develop``
-----------------------------

Si lo que querés es *traerte los ultimos cambios de develop a /www*, tenes que hacer un *pull del subtree*. Suponiendo que tenes los todos los remotos actualizados (``git fetch``)::

    git subtree pull --prefix=www origin develop

Por supuesto, ``origin`` puede ser cualquier remoto del que quieras traer
los datos, y ``develop`` otra rama con la estructura plana (sin ``www``)



.. _Preciosa: http://github.com/mgaitan/preciosa
.. _Phonegap: http://www.phonegap.com/
.. _develop: https://github.com/mgaitan/preciosa_mobile/tree
.. _Phonegap Build: http://build.phonegap.com
.. _git-subtree: https://github.com/git/git/blob/master/contrib/subtree/git-subtree.txt
.. _bajalo: https://github.com/git/git/blob/master/contrib/subtree/git-subtree.sh