<?php

declare(strict_types=1);

namespace Instruckt\Laravel\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Instruckt\Laravel\Models\InstrucktSession;

final class SessionController
{
    public function index(): JsonResponse
    {
        $sessions = InstrucktSession::query()
            ->latest()
            ->limit(100)
            ->get();

        return response()->json($sessions);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['url' => 'required|string|max:2048']);

        $session = InstrucktSession::query()->create([
            'url' => $request->input('url'),
        ]);

        return response()->json($session, 201);
    }

    public function show(string $id): JsonResponse
    {
        $session = InstrucktSession::query()->findOrFail($id);

        return response()->json([
            ...$session->toArray(),
            'annotations' => $session->annotations()->oldest()->get(),
        ]);
    }

    public function events(string $id): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        $session = InstrucktSession::query()->findOrFail($id);

        return response()->stream(function () use ($session) {
            $lastId = 0;

            while (true) {
                if (connection_aborted()) {
                    break;
                }

                // Fetch annotations updated since we last checked
                $annotations = $session->annotations()
                    ->where('updated_at', '>', now()->subSeconds(30))
                    ->where('id', '>', (string) $lastId)
                    ->get();

                foreach ($annotations as $annotation) {
                    echo 'event: annotation.updated' . PHP_EOL;
                    echo 'data: ' . $annotation->toJson() . PHP_EOL;
                    echo PHP_EOL;
                    $lastId = $annotation->id;
                }

                ob_flush();
                flush();
                sleep(1);
            }
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
