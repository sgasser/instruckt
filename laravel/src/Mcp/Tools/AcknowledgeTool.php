<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktAnnotation;
use Laravel\MCP\Contracts\Tool;

final class AcknowledgeTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_acknowledge';
    }

    public function description(): string
    {
        return 'Mark an annotation as acknowledged — signals to the user that the agent has seen their feedback and is working on it.';
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'annotation_id' => [
                    'type' => 'string',
                    'description' => 'The annotation ID to acknowledge',
                ],
            ],
            'required' => ['annotation_id'],
        ];
    }

    public function handle(array $input): array
    {
        $annotation = InstrucktAnnotation::query()->findOrFail($input['annotation_id']);
        $annotation->update(['status' => 'acknowledged']);

        return ['ok' => true, 'annotation' => $annotation->fresh()->toArray()];
    }
}
