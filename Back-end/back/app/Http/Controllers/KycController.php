<?php

namespace App\Http\Controllers;

use App\Models\KycDocument;
use App\Services\KycService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class KycController extends Controller
{
    public function __construct(
        private KycService $kycService
    ) {}

    public function index(Request $request)
    {
        $documents = KycDocument::where('user_id', $request->user()->id)
            ->latest()
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $documents
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type_document' => 'required|in:cni,passport',
            'fichier' => 'required|file|mimes:pdf,jpeg,png,jpg|max:5120',
        ]);

        $document = $this->kycService->submitDocument($request->user(), $validated);

        return response()->json([
            'success' => true,
            'message' => 'Document soumis avec succès',
            'data' => $document
        ], 201);
    }

    public function destroy(Request $request, $id)
    {
        $document = KycDocument::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();

        if ($document->statut !== 'en_attente') {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer un document déjà traité'
            ], 403);
        }

        if (Storage::disk('private')->exists($document->fichier)) {
            Storage::disk('private')->delete($document->fichier);
        }

        $document->delete();

        return response()->json([
            'success' => true,
            'message' => 'Document supprimé avec succès'
        ]);
    }
}
