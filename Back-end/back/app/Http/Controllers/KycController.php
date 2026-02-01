<?php

namespace App\Http\Controllers;

use App\Providers\KycProvider;
use App\Services\KycService;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Request;

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

}
