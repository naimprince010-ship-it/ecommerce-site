import Link from 'next/link';

export default function Products() {
  const products = [
    { id: 1, name: 'Product 1', price: 9.99 },
    { id: 2, name: 'Product 2', price: 14.99 },
    { id: 3, name: 'Product 3', price: 19.99 },
  ];

  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>
            <Link href={`/products/${product.id}`}>
              {product.name} - ${product.price.toFixed(2)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
