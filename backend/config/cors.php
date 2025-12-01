<?php

return [

    'paths' => ['api/*', 'login', 'register'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://studio-3053804889-a5dfb.web.app',
        'http://localhost:4200'
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => ['Authorization'],

    'supports_credentials' => false,
];
