<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktSession;
use Laravel\MCP\Contracts\Tool;

final class ListSessionsTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_list_sessions';
    }

    public function description(): string
    {
        return 'List all active instruckt annotation sessions for this application.';
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => new \stdClass(),
            'required' => [],
        ];
    }

    public function handle(array $input): array
    {
        $sessions = InstrucktSession::query()
            ->latest()
            ->limit(50)
            ->get(['id', 'url', 'status', 'created_at', 'updated_at']);

        return [
            'sessions' => $sessions->toArray(),
            'count' => $sessions->count(),
        ];
    }
}
