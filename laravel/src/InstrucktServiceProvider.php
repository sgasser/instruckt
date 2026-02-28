<?php

declare(strict_types=1);

namespace Instruckt\Laravel;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Instruckt\Laravel\Http\Controllers\AnnotationController;
use Instruckt\Laravel\Http\Controllers\SessionController;
use Instruckt\Laravel\Mcp\Tools\AcknowledgeTool;
use Instruckt\Laravel\Mcp\Tools\DismissTool;
use Instruckt\Laravel\Mcp\Tools\GetAllPendingTool;
use Instruckt\Laravel\Mcp\Tools\GetPendingTool;
use Instruckt\Laravel\Mcp\Tools\GetSessionTool;
use Instruckt\Laravel\Mcp\Tools\ListSessionsTool;
use Instruckt\Laravel\Mcp\Tools\ReplyTool;
use Instruckt\Laravel\Mcp\Tools\ResolveTool;
use Instruckt\Laravel\Mcp\Tools\WatchAnnotationsTool;

final class InstrucktServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(__DIR__ . '/../config/instruckt.php', 'instruckt');
    }

    public function boot(): void
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'instruckt');
        $this->publishAssets();
        $this->registerRoutes();
        $this->registerMcpTools();
        $this->registerBladeComponents();

        if ($this->app->runningInConsole()) {
            $this->console();
        }
    }

    private function registerRoutes(): void
    {
        if (! config('instruckt.enabled', true)) {
            return;
        }

        Route::middleware(config('instruckt.middleware', ['web']))
            ->prefix(config('instruckt.route_prefix', 'instruckt'))
            ->name('instruckt.')
            ->group(function () {
                Route::get('sessions', [SessionController::class, 'index'])->name('sessions.index');
                Route::post('sessions', [SessionController::class, 'store'])->name('sessions.store');
                Route::get('sessions/{id}', [SessionController::class, 'show'])->name('sessions.show');
                Route::get('sessions/{id}/events', [SessionController::class, 'events'])->name('sessions.events');
                Route::post('sessions/{sessionId}/annotations', [AnnotationController::class, 'store'])->name('annotations.store');
                Route::patch('annotations/{id}', [AnnotationController::class, 'update'])->name('annotations.update');
                Route::post('annotations/{id}/reply', [AnnotationController::class, 'reply'])->name('annotations.reply');
            });
    }

    private function registerMcpTools(): void
    {
        if (! config('instruckt.enabled', true)) {
            return;
        }

        // Register tools with laravel/mcp if it's available
        if (! class_exists(\Laravel\MCP\McpServiceProvider::class)) {
            return;
        }

        $tools = [
            ListSessionsTool::class,
            GetSessionTool::class,
            GetPendingTool::class,
            GetAllPendingTool::class,
            AcknowledgeTool::class,
            ResolveTool::class,
            DismissTool::class,
            ReplyTool::class,
            WatchAnnotationsTool::class,
        ];

        foreach ($tools as $toolClass) {
            $this->app->make(\Laravel\MCP\Server\McpServer::class)
                ->tool($this->app->make($toolClass));
        }
    }

    private function registerBladeComponents(): void
    {
        $this->loadViewComponentsAs('instruckt', [
            Components\Toolbar::class,
        ]);
    }

    private function publishAssets(): void
    {
        $this->publishes([
            __DIR__ . '/../config/instruckt.php' => config_path('instruckt.php'),
        ], 'instruckt-config');

        $this->publishes([
            __DIR__ . '/../database/migrations' => database_path('migrations'),
        ], 'instruckt-migrations');

        $this->publishes([
            __DIR__ . '/../dist' => public_path('vendor/instruckt'),
        ], 'instruckt-assets');
    }

    private function console(): void
    {
        $this->commands([
            Console\InstallCommand::class,
        ]);
    }
}
