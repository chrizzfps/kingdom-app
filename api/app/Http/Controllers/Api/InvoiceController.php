<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;

class InvoiceController extends Controller
{
    // Admin Methods
    public function index()
    {
        return Invoice::with(['project.client', 'items'])->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'due_date' => 'required|date',
            'status' => 'required|in:draft,sent,paid,overdue,cancelled',
            'tax_rate' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        // Calculate totals
        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $subtotal += $item['quantity'] * $item['unit_price'];
        }

        $discount = $validated['discount'] ?? 0;
        $taxRate = $validated['tax_rate'] ?? 0;
        
        $taxableAmount = max($subtotal - $discount, 0);
        $taxAmount = $taxableAmount * ($taxRate / 100);
        $total = $taxableAmount + $taxAmount;

        $invoice = Invoice::create([
            'project_id' => $validated['project_id'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'],
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'amount' => $total,
            'notes' => $validated['notes'] ?? null,
        ]);

        foreach ($validated['items'] as $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total' => $item['quantity'] * $item['unit_price'],
            ]);
        }

        return response()->json($invoice->load('items'), 201);
    }

    public function show(Invoice $invoice)
    {
        return $invoice->load(['project.client', 'items']);
    }

    public function update(Request $request, Invoice $invoice)
    {
        // If just updating status (quick update)
        if ($request->has('status') && count($request->all()) === 1) {
            $invoice->update(['status' => $request->status]);
            return response()->json($invoice);
        }

        $validated = $request->validate([
            'project_id' => 'required|exists:projects,id',
            'due_date' => 'required|date',
            'status' => 'required|in:draft,sent,paid,overdue,cancelled',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        // Calculate totals
        $subtotal = 0;
        foreach ($validated['items'] as $item) {
            $subtotal += $item['quantity'] * $item['unit_price'];
        }

        $discount = $validated['discount'] ?? 0;
        $taxRate = $validated['tax_rate'] ?? 0;
        
        $taxableAmount = max($subtotal - $discount, 0);
        $taxAmount = $taxableAmount * ($taxRate / 100);
        $total = $taxableAmount + $taxAmount;

        $invoice->update([
            'project_id' => $validated['project_id'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'],
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'amount' => $total,
            'notes' => $validated['notes'] ?? null,
        ]);

        // Sync items (Delete all and recreate)
        $invoice->items()->delete();

        foreach ($validated['items'] as $item) {
            $invoice->items()->create([
                'description' => $item['description'],
                'quantity' => $item['quantity'],
                'unit_price' => $item['unit_price'],
                'total' => $item['quantity'] * $item['unit_price'],
            ]);
        }

        return response()->json($invoice->load('items'));
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return response()->json(null, 204);
    }

    // Public Methods
    public function publicShow($uuid)
    {
        $invoice = Invoice::where('uuid', $uuid)->with(['project.client', 'items'])->firstOrFail();
        return response()->json($invoice);
    }

    public function downloadPdf($uuid)
    {
        $invoice = Invoice::where('uuid', $uuid)->with(['project.client', 'items'])->firstOrFail();
        
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.invoice', compact('invoice'));
        
        return $pdf->download('invoice-'.$uuid.'.pdf');
    }
}
