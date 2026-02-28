<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktAnnotation;
use Laravel\MCP\Contracts\Tool;

final class ReplyTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_reply';
    }

    public function description(): string
    {
        return 'Add a reply to an annotation thread. Use this to ask clarifying questions or provide status updates without resolving or dismissing the annotation.';
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'annotation_id' => [
                    'type' => 'string',
                    'description' => 'The annotation ID to reply to',
                ],
                'content' => [
                    'type' => 'string',
                    'description' => 'The reply message content',
                ],
            ],
            'required' => ['annotation_id', 'content'],
        ];
    }

    public function handle(array $input): array
    {
        $annotation = InstrucktAnnotation::query()->findOrFail($input['annotation_id']);
        $annotation->addThreadMessage('agent', $input['content']);

        return ['ok' => true, 'annotation' => $annotation->fresh()->toArray()];
    }
}
