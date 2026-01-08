<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReceivePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.item_id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity_received' => 'required|numeric|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'items.required' => __('Au moins un article doit être spécifié.'),
            'items.*.item_id.required' => __('L\'article est invalide.'),
            'items.*.quantity_received.required' => __('La quantité reçue est obligatoire.'),
            'items.*.quantity_received.min' => __('La quantité ne peut pas être négative.'),
        ];
    }
}
