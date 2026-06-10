import { DashboardMetrics } from '@/components/admin/dashboard/DashboardMetrics';
import { RecentActivity } from '@/components/admin/dashboard/RecentActivity';
import { RevenueChart } from '@/components/admin/dashboard/RevenueChart';

import { KingdomLoader } from '@/components/ui/KingdomLoader';
import { useState, useEffect } from 'react';

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    if (loading) return <KingdomLoader />;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Real Data Widgets */}
            <DashboardMetrics />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Revenue Chart */}
                <RevenueChart />

                {/* Real Activity Log */}
                <RecentActivity />
            </div>


        </div>
    );
}
