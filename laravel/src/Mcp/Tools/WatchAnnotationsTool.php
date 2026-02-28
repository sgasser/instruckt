<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Mcp\Tools;

use Instruckt\Laravel\Models\InstrucktAnnotation;
use Laravel\MCP\Contracts\Tool;

final class WatchAnnotationsTool implements Tool
{
    public function name(): string
    {
        return config('instruckt.mcp_prefix') . '_watch_annotations';
    }

    public function description(): string
    {
        return 'Block and wait for new annotations to arrive, then return them as a batch. '
            . 'Use this in an agent loop to automatically process feedback as users annotate the page. '
            . 'Returns immediately if annotations already exist; otherwise polls until timeout.';
    }

    public function inputSchema(): array
    {
        return [
            'type' => 'object',
            'properties' => [
                'session_id' => [
                    'type' => 'string',
                    'description' => 'Optional session ID to watch. If omitted, watches all sessions.',
                ],
                'timeout_seconds' => [
                    'type' => 'integer',
                    'description' => 'How long to wait for new annotations (default: 30, max: 120)',
                    'default' => 30,
                ],
                'batch_window_seconds' => [
                    'type' => 'integer',
                    'description' => 'After first annotation arrives, wait this many more seconds to collect a batch (default: 3)',
                    'default' => 3,
                ],
            ],
            'required' => [],
        ];
    }

    public function handle(array $input): array
    {
        $sessionId = $input['session_id'] ?? null;
        $timeout = min((int) ($input['timeout_seconds'] ?? 30), 120);
        $batchWindow = min((int) ($input['batch_window_seconds'] ?? 3), 10);

        $deadline = time() + $timeout;
        $batchDeadline = null;

        while (true) {
            $query = InstrucktAnnotation::query()
                ->whereIn('status', ['pending'])
                ->oldest();

            if ($sessionId) {
                $query->where('session_id', $sessionId);
            }

            $annotations = $query->get();

            if ($annotations->isNotEmpty()) {
                if ($batchDeadline === null) {
                    // First hit — open batch window
                    $batchDeadline = time() + $batchWindow;
                }

                if (time() >= $batchDeadline) {
                    // Batch window closed — return what we have
                    return [
                        'count' => $annotations->count(),
                        'annotations' => $annotations->toArray(),
                        'timed_out' => false,
                    ];
                }
            }

            if (time() >= $deadline) {
                return [
                    'count' => $annotations->count(),
                    'annotations' => $annotations->toArray(),
                    'timed_out' => $annotations->isEmpty(),
                    'message' => $annotations->isEmpty()
                        ? 'No new annotations within timeout period. Call again to continue watching.'
                        : null,
                ];
            }

            sleep(1);
        }
    }
}
