#!/bin/bash

echo "Iniciando workers de Laravel..."

php artisan simular:precios --loop --interval=5 &
php artisan ordenes:procesar --loop --interval=5 &

# Mantener el contenedor vivo
tail -f /dev/null
