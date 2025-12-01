<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
{
    $data = $request->validate([
        'name' => 'required|string|min:2|max:100',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed'
    ]);

    $user = User::create([
        'name' => $data['name'],
        'email' => $data['email'],
        'password' => $data['password'], 
        'saldo' => 0,
    ]);

    $token = $user->createToken('api_token')->plainTextToken;

    return response()->json([
        'message' => 'Registro correcto',
        'token' => $token,
        'user' => ['id'=>$user->id, 'name'=>$user->name, 'email'=>$user->email]
    ], 201);
}

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Credenciales inválidas.'],
            ]);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'message' => 'Login correcto',
            'token' => $token,
            'user' => ['id'=>$user->id, 'name'=>$user->name, 'email'=>$user->email]
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logout correcto']);
    }

    public function resetPassword(Request $request)
{
    $data = $request->validate([
        'usuario' => 'required|string',
        'password' => 'required|string|min:8|confirmed'
    ]);

    $user = User::where('email', $data['usuario'])
                ->orWhere('name', $data['usuario'])
                ->first();

    if (! $user) {
        return response()->json(['message' => 'Usuario no encontrado'], 404);
    }

    $user->password = Hash::make($data['password']);
    $user->save();

    return response()->json(['message' => 'Contraseña actualizada correctamente']);
}

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
