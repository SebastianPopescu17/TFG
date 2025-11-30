FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    unzip \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    curl \
    git

RUN docker-php-ext-install pdo pdo_mysql mbstring exif pcntl bcmath gd

RUN a2enmod rewrite

# Copiar config limpia de apache
COPY apache-laravel.conf /etc/apache2/conf-available/laravel.conf
RUN a2enconf laravel

WORKDIR /var/www/html

COPY . .

RUN chmod -R 775 storage bootstrap/cache
RUN chmod +x /var/www/html/start.sh

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader

EXPOSE 80

CMD ["/bin/bash", "/var/www/html/start.sh"]
