<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp;

use Instruckt\Laravel\Mcp\Tools\GetAllPendingTool;
use Instruckt\Laravel\Mcp\Tools\GetScreenshotTool;
use Instruckt\Laravel\Mcp\Tools\ResolveTool;
use Laravel\Mcp\Server;

final class InstrucktServer extends Server
{
    /**
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        GetAllPendingTool::class,
        GetScreenshotTool::class,
        ResolveTool::class,
    ];
}
