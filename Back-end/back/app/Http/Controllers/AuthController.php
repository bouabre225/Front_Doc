<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Http\Requests\loginRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function registerBuyer(RegisterRequest $request, AuthService $authService)
    {
        try {
            //valider les données 
            $user = $authService->registerBuyer($request->validated());
            
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
     * Register Seller
     */
    public function registerSeller(RegisterRequest $request, AuthService $authService){
        try {
            //valider les donnees
            $user = $authService->registerSeller($request->validated());
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
            $data = $request->validated();

            $user = $authService->login($data['email'], $data['password']);   
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
     * 
     */
    public function loginAdmin(loginRequest $request, AuthService $service)
    {
        try {
            //valider les données 
            $data = $request->validated();

            $user = $service->loginAdmin($data['email'], $data['password']);
            return response()->json([
                'user' => $user,
                'message' => 'Admin logged in successfully',
            ], 200);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Logout 
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
