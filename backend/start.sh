#!/bin/bash
set -e

# Migraciones y seeders
php artisan migrate --force
php artisan db:seed --force

# Lanzar simulador en segundo plano
php artisan simular:precios --loop --interval=5 &

# Mantener Apache en foreground
exec apache2-foreground
