<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\loginRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\Request;

class Authcontroller extends Controller
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request, AuthService $authService)
    {
        try {
            //valider les données 
            $user = $authService->register($request->validated());
            
            //retour de la reponse 
            return response()->json([
                'user' => $user,
                'message' => 'User registered successfully',
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Login a user
     */
    public function login(loginRequest $request, AuthService $authService)
    {
        try {
            //valider les données
            $user = $authService->login($request->validated());
            
            return response()->json([
                'user' => $user,
                'message' => 'User logged in successfully',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout a user
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->tokens()->delete();
            return response()->json(['message' => 'Déconnecté']);

        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
