export function getDeterministicPriceOrError(isbn: string): number | null {
  // Create a hash from the ISBN
  let hash = 0;
  for (let i = 0; i < isbn.length; i++) {
    const char = isbn.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  // Use the hash to determine if we should return a price or error
  const shouldReturnPrice = Math.abs(hash) % 2 === 0;

  if (!shouldReturnPrice) {
    return null; // Simulate 404 error
  }
  // Generate a price between 10 and 5000 based on the hash
  const price = 10 + (Math.abs(hash) % 4990);
  return price;
}
