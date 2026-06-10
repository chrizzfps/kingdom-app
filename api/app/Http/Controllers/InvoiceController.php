<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class InvoiceController extends Controller
{
    /**
     * Generate PDF from provided JSON data (Stateless).
     * This allows the frontend (React + Firestore) to send the data logic
     * and use Laravel purely as a rendering engine for DomPDF.
     */
    public function generateUnsaved(Request $request)
    {
        try {
            // 1. Validate incoming data
            $data = $request->validate([
                'invoice.uuid' => 'nullable|string',
                'invoice.invoice_number' => 'required|string',
                'invoice.created_at' => 'nullable|string',
                'invoice.due_date' => 'nullable|string',
                
                'company.name' => 'required|string',
                'company.email' => 'nullable|string',
                'company.phone' => 'nullable|string',
                'company.address' => 'nullable|string',
                'company.tax_id' => 'nullable|string',
                'company.logotype_url' => 'nullable|string',
                'company.isotype_url' => 'nullable|string',
                'company.terms' => 'nullable|string',
                
                'branding.header_bg_url' => 'nullable|string',
                'branding.footer_bg_url' => 'nullable|string',
                
                'customer.name' => 'required|string',
                'customer.email' => 'nullable|string',
                'customer.phone' => 'nullable|string',
                'customer.address' => 'nullable|string',
                'customer.tax_id' => 'nullable|string',
                
                'items' => 'required|array',
                'items.*.description' => 'required|string',
                'items.*.quantity' => 'required|numeric',
                'items.*.unit_price' => 'required|numeric',
                
                'totals.subtotal' => 'required|numeric',
                'totals.discount' => 'nullable|numeric',
                'totals.tax_rate' => 'nullable|numeric',
                'totals.tax' => 'nullable|numeric',
                'totals.total' => 'required|numeric',
                'currency_symbol' => 'nullable|string',
            ]);

            // 2. Prepare View Data
            $viewData = [
                'invoice' => $data['invoice'],
                'company' => $data['company'],
                'branding' => $data['branding'] ?? [],
                'customer' => $data['customer'],
                'items' => $data['items'],
                'totals' => $data['totals'],
                'currency' => $data['currency_symbol'] ?? '$',
            ];

            // 3. Render PDF
            // 'isRemoteEnabled' is CRITICAL for loading images from URLs (http://...)
            $pdf = Pdf::setOptions(['isRemoteEnabled' => true, 'isHtml5ParserEnabled' => true])
                      ->loadView('pdf.invoice', $viewData);
            
            $pdf->setPaper('a4', 'portrait');

            // 4. Return Output with Headers
            return response($pdf->output())
                ->header('Content-Type', 'application/pdf')
                ->header('Access-Control-Allow-Origin', '*')
                ->header('Access-Control-Allow-Methods', 'POST, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization, X-Requested-With');

        } catch (\Exception $e) {
            Log::error('PDF Generation Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500)
                ->header('Access-Control-Allow-Origin', '*');
        }
    }
}
