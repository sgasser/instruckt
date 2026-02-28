<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | Enable instruckt
    |--------------------------------------------------------------------------
    | Set to false in production or use an environment variable to gate access.
    */
    'enabled' => (bool) env('INSTRUCKT_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Route prefix
    |--------------------------------------------------------------------------
    | All HTTP API routes will be registered under this prefix.
    */
    'route_prefix' => env('INSTRUCKT_ROUTE_PREFIX', 'instruckt'),

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    | Applied to all instruckt API routes. 'web' gives you session/CSRF.
    | Add 'auth' here if you want to gate annotations to logged-in users.
    */
    'middleware' => explode(',', env('INSTRUCKT_MIDDLEWARE', 'web')),

    /*
    |--------------------------------------------------------------------------
    | CDN URL
    |--------------------------------------------------------------------------
    | Where to load instruckt.iife.js from. By default uses the published
    | asset. Override to use a pinned CDN version.
    |
    | Example: 'https://cdn.jsdelivr.net/npm/instruckt@0.1.0/dist/instruckt.iife.js'
    */
    'cdn_url' => env('INSTRUCKT_CDN_URL', null),

    /*
    |--------------------------------------------------------------------------
    | MCP tool name prefix
    |--------------------------------------------------------------------------
    */
    'mcp_prefix' => 'instruckt',

];
