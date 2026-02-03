<?php

namespace App\Http\Controllers;

use App\Models\KycDocument;
use App\Providers\KycProvider;
use App\Services\KycService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KycController extends Controller
{
    //
    /**
     * @throws ConnectionException
     */
    public function submit(Request $request, KycService $kycService){
        $request->validate([
            'type_document'=> 'required|in:cni,passport',
            'fichier' => 'required|file|mimes:jpeg,png,jpg,gif|max:2048',
        ]);
        return $kycService->submitDocument(
            $request->user(),
            $request->only(['type_document', 'fichier'])
        );
    }

    //user can get is own kyc documents
    public function index(Request $request)
    {
        $document = KycDocument::where('user_id', $request->user()->id)
            ->latest()
            ->get();
        return response()->json($document);
    }

    public function store(Request $request){

    }

    public function allDocument()
    {

    }

public

}
