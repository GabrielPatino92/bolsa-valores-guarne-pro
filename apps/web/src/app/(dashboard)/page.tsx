export default function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Equity Total</h3>
          <p className="text-3xl font-bold mt-2">$12,450.00</p>
          <p className="text-green-600 text-sm mt-2">+8.2%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">PnL Hoy</h3>
          <p className="text-3xl font-bold mt-2">+$825.50</p>
          <p className="text-green-600 text-sm mt-2">+2.4%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Max Drawdown</h3>
          <p className="text-3xl font-bold mt-2">-5.2%</p>
          <p className="text-red-600 text-sm mt-2">-1.1%</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 text-sm">Win Rate</h3>
          <p className="text-3xl font-bold mt-2">68%</p>
          <p className="text-green-600 text-sm mt-2">+3.5%</p>
        </div>
      </div>
    </div>
  );
}
