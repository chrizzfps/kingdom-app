<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->decimal('subtotal', 10, 2)->after('amount')->default(0);
            $table->decimal('tax_rate', 5, 2)->after('subtotal')->default(0);
            $table->decimal('tax_amount', 10, 2)->after('tax_rate')->default(0);
            $table->decimal('discount', 10, 2)->after('tax_amount')->default(0);
            $table->text('notes')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['subtotal', 'tax_rate', 'tax_amount', 'discount', 'notes']);
        });
    }
};
