import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
  const stats = [
    { label: 'Active Tasks', value: 3 },
    { label: 'Completed (30d)', value: 12 },
    { label: 'Avg. Turnaround', value: '36h' },
    { label: 'Next Renewal', value: 'Sep 30, 2025' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-500">{s.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Table */}
      <Card>
        <CardHeader>
          <CardTitle>Task Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Title</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Updated</th>
                <th className="py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td>Homepage redesign</td>
                <td>
                  <Badge variant="secondary">In Progress</Badge>
                </td>
                <td>Sep 20</td>
                <td>
                  <a href="#" className="text-blue-600">
                    Open
                  </a>
                </td>
              </tr>
              <tr className="border-b">
                <td>Logo revisions</td>
                <td>
                  <Badge className="bg-yellow-200 text-yellow-800">Review</Badge>
                </td>
                <td>Sep 19</td>
                <td>
                  <a href="#" className="text-blue-600">
                    Open
                  </a>
                </td>
              </tr>
              <tr>
                <td>Brand guidelines</td>
                <td>
                  <Badge className="bg-green-200 text-green-800">Completed</Badge>
                </td>
                <td>Sep 15</td>
                <td>
                  <a href="#" className="text-blue-600">
                    View
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 text-left">Invoice #</th>
                <th className="py-2 text-left">Period</th>
                <th className="py-2 text-left">Amount</th>
                <th className="py-2 text-left">Status</th>
                <th className="py-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td>INV-2025-001</td>
                <td>Sep 1–30</td>
                <td>IDR 3,000,000</td>
                <td>
                  <Badge className="bg-green-200 text-green-800">Paid</Badge>
                </td>
                <td>
                  <a href="#" className="text-blue-600">
                    PDF
                  </a>
                </td>
              </tr>
              <tr>
                <td>INV-2025-002</td>
                <td>Aug 1–31</td>
                <td>IDR 3,000,000</td>
                <td>
                  <Badge className="bg-red-200 text-red-800">Unpaid</Badge>
                </td>
                <td>
                  <a href="#" className="text-blue-600">
                    Pay
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
