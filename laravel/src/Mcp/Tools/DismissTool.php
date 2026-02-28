<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktAnnotation;
use Laravel\MCP\Contracts\Tool;

final class DismissTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_dismiss';
    }

    public function description(): string
    {
        return 'Dismiss an annotation with a reason. Use this when the feedback is not actionable or out of scope. The reason is posted as an agent thread message visible to the user.';
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'annotation_id' => [
                    'type' => 'string',
                    'description' => 'The annotation ID to dismiss',
                ],
                'reason' => [
                    'type' => 'string',
                    'description' => 'Explanation of why this feedback is being dismissed',
                ],
            ],
            'required' => ['annotation_id', 'reason'],
        ];
    }

    public function handle(array $input): array
    {
        $annotation = InstrucktAnnotation::query()->findOrFail($input['annotation_id']);

        $annotation->update([
            'status' => 'dismissed',
            'resolved_by' => 'agent',
            'resolved_at' => now(),
        ]);

        $annotation->addThreadMessage('agent', $input['reason']);

        return ['ok' => true, 'annotation' => $annotation->fresh()->toArray()];
    }
}
