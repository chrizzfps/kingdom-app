<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Factura #{{ $invoice['invoice_number'] ?? '' }}</title>
    
    <!-- Google Fonts: Inter -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <style>
        @page {
            margin: 0;
            padding: 0;
        }
        * {
            box-sizing: border-box;
        }
        body {
            margin: 0;
            padding: 0;
            color: #1e293b;
            font-size: 12px;
            font-family: 'Inter', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif;
            background: #fff;
            line-height: 1.4;
        }
        
        /* Layout */
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        /* ===== HEADER BACKGROUND ===== */
        .header-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 180px;
            z-index: -1;
            overflow: hidden;
        }
        .header-bg img {
            width: 100%;
            height: 180px;
            object-fit: cover;
        }
        .header-bg-gradient {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 180px;
            background: linear-gradient(135deg, rgba(123, 181, 255, 0.45) 0%, rgba(255,255,255,0) 60%),
                        linear-gradient(225deg, rgba(0, 211, 255, 0.25) 0%, rgba(255,255,255,0) 60%);
            z-index: -1;
            border-bottom-left-radius: 24px;
            border-bottom-right-radius: 24px;
        }
        
        /* ===== FOOTER BACKGROUND ===== */
        .footer-bg {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 120px;
            z-index: -1;
            overflow: hidden;
        }
        .footer-bg img {
            width: 100%;
            height: 120px;
            object-fit: cover;
        }
        .footer-bg-gradient {
            position: fixed;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 120px;
            background: linear-gradient(to top, rgba(123, 181, 255, 0.15) 0%, rgba(255,255,255,0) 100%);
            z-index: -1;
        }
        
        /* ===== ISOTYPE WATERMARK - aligned to right ===== */
        .isotype-watermark {
            position: fixed;
            bottom: 45px;
            right: 40px;
            z-index: 0;
        }
        .isotype-watermark img {
            width: 70px;
            height: auto;
        }
        
        /* ===== CONTAINER ===== */
        .container {
            padding: 40px;
            position: relative;
        }
        
        /* ===== HEADER SECTION ===== */
        .header-table td {
            vertical-align: top;
        }
        /* Logo box - centered with table */
        .logo-box {
            width: 100px;
            height: 100px;
            background: #fff;
            border-radius: 20px;
            border: 1px solid #f1f5f9;
            overflow: hidden;
        }
        .logo-box-inner {
            width: 100%;
            height: 100px;
        }
        .logo-box-inner td {
            text-align: center;
            vertical-align: middle;
            height: 100px;
        }
        .logo-img {
            max-width: 75px;
            max-height: 65px;
        }
        .invoice-badge-container {
            text-align: right;
        }
        .invoice-badge {
            display: inline-block;
            background: rgba(255,255,255,0.95);
            border: 1px solid #e2e8f0;
            padding: 10px 24px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #1e293b;
        }
        .invoice-number {
            margin-top: 10px;
            font-weight: 700;
            font-size: 15px;
            color: #334155;
        }

        /* ===== INFO SECTION - with more top margin ===== */
        .info-table {
            margin-top: 55px;
            margin-bottom: 35px;
        }
        .info-table td {
            vertical-align: top;
            padding: 0 10px;
        }
        .info-table td:first-child {
            padding-left: 0;
        }
        .info-table td:last-child {
            padding-right: 0;
        }
        .pill-label {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .pill-blue { 
            background: #eff6ff; 
            color: #3b82f6; 
        }
        .pill-sky { 
            background: #f0f9ff; 
            color: #0ea5e9; 
        }
        .pill-green {
            background: #f0fdf4;
            color: #22c55e;
        }
        .section-title { 
            font-size: 14px;
            font-weight: 700; 
            color: #0f172a; 
            margin-bottom: 4px; 
        }
        .text-muted { 
            color: #64748b; 
            font-size: 10px;
            line-height: 1.5; 
        }
        .tax-id {
            color: #94a3b8;
            font-size: 9px;
            margin-top: 4px;
        }

        /* ===== ITEMS TABLE ===== */
        .items-wrapper {
            background-color: #f8fafc;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 24px;
        }
        .items-table {
            width: 100%;
        }
        .items-table th {
            padding: 12px 16px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            color: #64748b;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #e2e8f0;
            background: #f1f5f9;
        }
        .items-table td {
            padding: 14px 16px;
            font-size: 11px;
            color: #1e293b;
            border-bottom: 1px solid #f1f5f9;
        }
        .items-table tr:last-child td {
            border-bottom: none;
        }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-left { text-align: left; }

        /* ===== TOTALS ===== */
        .totals-outer {
            width: 100%;
        }
        .totals-inner {
            width: 100%;
        }
        .totals-inner td {
            padding: 5px 0;
            font-size: 11px;
        }
        .totals-label {
            color: #64748b;
        }
        .totals-value {
            text-align: right;
            font-weight: 600;
            color: #1e293b;
        }
        .total-row td {
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
            font-weight: 700;
            font-size: 13px;
            color: #0f172a;
        }
        .total-row .totals-value {
            color: #2563eb;
            font-size: 14px;
        }

        /* ===== FOOTER ===== */
        .footer {
            position: fixed;
            bottom: 25px;
            left: 40px;
            right: 40px;
        }
        .footer-company {
            font-weight: 700;
            font-size: 11px;
            color: #0f172a;
            margin-bottom: 2px;
        }
        .footer-info {
            font-size: 9px;
            color: #64748b;
            line-height: 1.5;
        }
        .footer-page {
            font-size: 9px;
            color: #94a3b8;
        }
    </style>
</head>
<body>
    <!-- ===== BACKGROUNDS ===== -->
    
    <!-- Header Background -->
    @if(!empty($branding['header_bg_url']))
        <div class="header-bg">
            <img src="{{ $branding['header_bg_url'] }}" alt="">
        </div>
    @else
        <div class="header-bg-gradient"></div>
    @endif
    
    <!-- Footer Background -->
    @if(!empty($branding['footer_bg_url']))
        <div class="footer-bg">
            <img src="{{ $branding['footer_bg_url'] }}" alt="">
        </div>
    @else
        <div class="footer-bg-gradient"></div>
    @endif
    
    <!-- Isotype Watermark - aligned to right edge -->
    @if(!empty($company['isotype_url']))
        <div class="isotype-watermark">
            <img src="{{ $company['isotype_url'] }}" alt="">
        </div>
    @endif

    <!-- ===== MAIN CONTAINER ===== -->
    <div class="container">
        
        <!-- Header -->
        <table class="header-table">
            <tr>
                <!-- Logo - Centered using nested table with explicit height -->
                <td style="width: 50%;">
                    <div class="logo-box">
                        <table class="logo-box-inner" cellpadding="0" cellspacing="0">
                            <tr>
                                <td style="width: 100px; height: 100px; text-align: center; vertical-align: middle;">
                                    @if(!empty($company['logotype_url']))
                                        <img src="{{ $company['logotype_url'] }}" class="logo-img" alt="Logo">
                                    @else
                                        <span style="font-size: 14px; font-weight: 700; color: #64748b;">LOGO</span>
                                    @endif
                                </td>
                            </tr>
                        </table>
                    </div>
                </td>
                <!-- Badge -->
                <td style="width: 50%; text-align: right;">
                    <div class="invoice-badge-container">
                        <span class="invoice-badge">FACTURA</span>
                        <div class="invoice-number">#{{ $invoice['invoice_number'] ?? $invoice['uuid'] ?? '' }}</div>
                    </div>
                </td>
            </tr>
        </table>

        <!-- Info Grid: 3 columns with equal spacing -->
        <table class="info-table">
            <tr>
                <!-- INVOICE FROM (Company/Kingdom) -->
                <td style="width: 30%;">
                    <div class="pill-label pill-green">INVOICE FROM:</div>
                    <div class="section-title">{{ $company['name'] ?? 'Kingdom Agency' }}</div>
                    <div class="text-muted">
                        @if(!empty($company['phone'])){{ $company['phone'] }}<br>@endif
                        @if(!empty($company['email'])){{ $company['email'] }}<br>@endif
                        @if(!empty($company['address'])){{ $company['address'] }}@endif
                    </div>
                    @if(!empty($company['tax_id']))
                        <div class="tax-id">NIF/CIF: {{ $company['tax_id'] }}</div>
                    @endif
                </td>
                <!-- INVOICE TO (Customer) - centered with padding -->
                <td style="width: 35%; text-align: center;">
                    <div style="text-align: left; padding-left: 20px;">
                        <div class="pill-label pill-blue">INVOICE TO:</div>
                        <div class="section-title">{{ $customer['name'] ?? 'Cliente' }}</div>
                        <div class="text-muted">
                            @if(!empty($customer['phone'])){{ $customer['phone'] }}<br>@endif
                            @if(!empty($customer['email'])){{ $customer['email'] }}<br>@endif
                            @if(!empty($customer['address'])){{ $customer['address'] }}@endif
                        </div>
                        @if(!empty($customer['tax_id']))
                            <div class="tax-id">NIF/CIF: {{ $customer['tax_id'] }}</div>
                        @endif
                    </div>
                </td>
                <!-- INVOICE INFO (Dates) -->
                <td style="width: 35%; text-align: right; vertical-align: top;">
                    <div class="pill-label pill-sky">INVOICE INFO:</div>
                    <div class="text-muted" style="text-align: right;">
                        <strong>Fecha de Creación:</strong> {{ isset($invoice['created_at']) ? \Carbon\Carbon::parse($invoice['created_at'])->locale('es')->isoFormat('D/MM/YYYY') : now()->format('d/m/Y') }}<br>
                        <strong>Vencimiento:</strong> {{ isset($invoice['due_date']) ? \Carbon\Carbon::parse($invoice['due_date'])->locale('es')->isoFormat('D/MM/YYYY') : 'N/A' }}
                    </div>
                </td>
            </tr>
        </table>

        <!-- Items Table -->
        <div class="items-wrapper">
            <table class="items-table">
                <thead>
                    <tr>
                        <th class="text-left">DESCRIPCIÓN</th>
                        <th class="text-center" style="width: 70px;">CANT.</th>
                        <th class="text-right" style="width: 100px;">PRECIO U.</th>
                        <th class="text-right" style="width: 100px;">TOTAL</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($items as $item)
                    <tr>
                        <td>{{ $item['description'] }}</td>
                        <td class="text-center">{{ $item['quantity'] }}</td>
                        <td class="text-right">{{ $currency }}{{ number_format($item['unit_price'], 2) }}</td>
                        <td class="text-right"><strong>{{ $currency }}{{ number_format($item['quantity'] * $item['unit_price'], 2) }}</strong></td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <!-- Totals -->
        <table class="totals-outer">
            <tr>
                <td style="width: 55%;"></td>
                <td style="width: 45%;">
                    <table class="totals-inner">
                        <tr>
                            <td class="totals-label">Subtotal</td>
                            <td class="totals-value">{{ $currency }}{{ number_format($totals['subtotal'] ?? 0, 2) }}</td>
                        </tr>
                        @if(($totals['discount'] ?? 0) > 0)
                        <tr>
                            <td class="totals-label" style="color: #ef4444;">Descuento</td>
                            <td class="totals-value" style="color: #ef4444;">-{{ $currency }}{{ number_format($totals['discount'], 2) }}</td>
                        </tr>
                        @endif
                        @if(($totals['tax'] ?? 0) > 0)
                        <tr>
                            <td class="totals-label">Impuesto ({{ $totals['tax_rate'] ?? 0 }}%)</td>
                            <td class="totals-value">{{ $currency }}{{ number_format($totals['tax'], 2) }}</td>
                        </tr>
                        @endif
                        <tr class="total-row">
                            <td class="totals-label">TOTAL</td>
                            <td class="totals-value">{{ $currency }}{{ number_format($totals['total'] ?? 0, 2) }}</td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>

    <!-- ===== FOOTER ===== -->
    <div class="footer">
        <table style="width: 100%;">
            <tr>
                <td style="width: 70%; vertical-align: bottom;">
                    <div class="footer-company">{{ $company['name'] ?? 'KINGDOM AGENCY' }}</div>
                    <div class="footer-info">
                        @if(!empty($company['terms']))
                            {!! nl2br(e($company['terms'])) !!}
                        @else
                            Gracias por confiar en nuestros servicios. Todos los derechos reservados.
                        @endif
                    </div>
                </td>
                <td style="width: 30%; text-align: right; vertical-align: bottom;">
                    <div class="footer-page">Página 1 de 1</div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
