<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktSession;
use Laravel\MCP\Contracts\Tool;

final class GetPendingTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_get_pending';
    }

    public function description(): string
    {
        return 'Get all pending (unacknowledged) annotations for a specific session.';
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'session_id' => [
                    'type' => 'string',
                    'description' => 'The session ID to check for pending annotations',
                ],
            ],
            'required' => ['session_id'],
        ];
    }

    public function handle(array $input): array
    {
        $session = InstrucktSession::query()->findOrFail($input['session_id']);
        $annotations = $session->pendingAnnotations()->get();

        return [
            'session_id' => $session->id,
            'count' => $annotations->count(),
            'annotations' => $annotations->toArray(),
        ];
    }
}
