#!/bin/bash
php artisan migrate --force
php artisan db:seed --force
php artisan simular:precios --loop --interval=5 &
exec apache2-foreground
