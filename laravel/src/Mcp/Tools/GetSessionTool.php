<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktSession;
use Laravel\MCP\Contracts\Tool;

final class GetSessionTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_get_session';
    }

    public function description(): string
    {
        return 'Get a specific instruckt session with all its annotations. Returns full annotation details including element selectors, Livewire/Vue/Svelte component context, and thread messages.';
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'session_id' => [
                    'type' => 'string',
                    'description' => 'The session ID to retrieve',
                ],
            ],
            'required' => ['session_id'],
        ];
    }

    public function handle(array $input): array
    {
        $session = InstrucktSession::query()->findOrFail($input['session_id']);

        return [
            ...$session->toArray(),
            'annotations' => $session->annotations()->oldest()->get()->toArray(),
        ];
    }
}
