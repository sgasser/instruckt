<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktAnnotation;
use Laravel\MCP\Contracts\Tool;

final class GetAllPendingTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_get_all_pending';
    }

    public function description(): string
    {
        return 'Get all pending annotations across every session. Use this to get a global view of unresolved feedback.';
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
        $annotations = InstrucktAnnotation::query()
            ->whereIn('status', ['pending', 'acknowledged'])
            ->with('session:id,url,status')
            ->oldest()
            ->get();

        return [
            'count' => $annotations->count(),
            'annotations' => $annotations->toArray(),
        ];
    }
}
