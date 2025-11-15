import { useRouter } from 'next/router';

export default function ProductDetails() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Product Details</h1>
      <p>Details for product ID: {id}</p>
    </div>
  );
}
