<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktAnnotation;
use Laravel\MCP\Contracts\Tool;

final class ResolveTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_resolve';
    }

    public function description(): string
    {
        return 'Mark an annotation as resolved. Optionally provide a summary of what was changed. The summary is posted as an agent thread message visible to the user.';
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'annotation_id' => [
                    'type' => 'string',
                    'description' => 'The annotation ID to resolve',
                ],
                'summary' => [
                    'type' => 'string',
                    'description' => 'Optional summary of what was changed to address this feedback',
                ],
            ],
            'required' => ['annotation_id'],
        ];
    }

    public function handle(array $input): array
    {
        $annotation = InstrucktAnnotation::query()->findOrFail($input['annotation_id']);

        $annotation->update([
            'status' => 'resolved',
            'resolved_by' => 'agent',
            'resolved_at' => now(),
        ]);

        if (!empty($input['summary'])) {
            $annotation->addThreadMessage('agent', $input['summary']);
        }

        return ['ok' => true, 'annotation' => $annotation->fresh()->toArray()];
    }
}
