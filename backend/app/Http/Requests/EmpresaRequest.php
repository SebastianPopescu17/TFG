<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmpresaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nombre' => 'required|string|max:255',
            'simbolo' => 'required|string|max:10|unique:empresas,simbolo,' . $this->route('empresa'),
            'sector' => 'required|string|max:100',
            'descripcion' => 'required|string',
            'capitalizacion' => 'required|numeric|min:0',
            'empleados' => 'required|integer|min:0',
            'pais' => 'required|string|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la empresa es obligatorio',
            'simbolo.required' => 'El símbolo bursátil es obligatorio',
            'simbolo.unique' => 'Este símbolo bursátil ya está registrado',
            'sector.required' => 'El sector es obligatorio',
            'descripcion.required' => 'La descripción es obligatoria',
            'capitalizacion.required' => 'La capitalización es obligatoria',
            'capitalizacion.numeric' => 'La capitalización debe ser un número',
            'empleados.required' => 'El número de empleados es obligatorio',
            'empleados.integer' => 'El número de empleados debe ser un número entero',
            'pais.required' => 'El país es obligatorio',
        ];
    }
}