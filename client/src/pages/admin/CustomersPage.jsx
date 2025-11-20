const fakeCustomers = [
  { name: 'Jane Doe', email: 'jane@example.com', orders: 5, spent: '$540.00' },
  { name: 'John Smith', email: 'john@example.com', orders: 2, spent: '$180.00' },
  { name: 'Alex Lee', email: 'alex@example.com', orders: 7, spent: '$910.00' },
];

export default function CustomersPage() {
  return (
    <div className="container">
      <header className="stacked">
        <h1>Customers</h1>
        <p className="muted">Simple customer overview</p>
      </header>

      <div className="card table-card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {fakeCustomers.map((customer) => (
                <tr key={customer.email}>
                  <td>{customer.name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.orders}</td>
                  <td>{customer.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
