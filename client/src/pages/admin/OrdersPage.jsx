const fakeOrders = [
  { id: 'ORD-1001', customer: 'Jane Doe', total: '$120.00', status: 'Processing' },
  { id: 'ORD-1002', customer: 'John Smith', total: '$89.50', status: 'Shipped' },
  { id: 'ORD-1003', customer: 'Alex Lee', total: '$42.00', status: 'Pending' },
];

export default function OrdersPage() {
  return (
    <div className="container">
      <header className="stacked">
        <h1>Orders</h1>
        <p className="muted">Overview of recent orders</p>
      </header>

      <div className="card table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fakeOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.total}</td>
                  <td>
                    <span className="pill subtle">{order.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
