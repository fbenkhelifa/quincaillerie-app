<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePurchaseOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'supplier_id' => 'required|exists:suppliers,id',
            'order_date' => 'required|date',
            'expected_date' => 'nullable|date|after_or_equal:order_date',
            'tax' => 'nullable|numeric|min:0',
            'shipping' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'supplier_notes' => 'nullable|string|max:1000',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity_ordered' => 'required|numeric|min:0.01',
            'items.*.unit_cost' => 'required|numeric|min:0',
            'items.*.suggestion_id' => 'nullable|exists:reorder_suggestions,id',
        ];
    }

    public function messages(): array
    {
        return [
            'supplier_id.required' => __('Le fournisseur est obligatoire.'),
            'order_date.required' => __('La date de commande est obligatoire.'),
            'items.required' => __('Au moins un article est requis.'),
            'items.min' => __('Au moins un article est requis.'),
            'items.*.product_id.required' => __('Le produit est obligatoire.'),
            'items.*.quantity_ordered.required' => __('La quantité est obligatoire.'),
            'items.*.quantity_ordered.min' => __('La quantité doit être positive.'),
        ];
    }
}
