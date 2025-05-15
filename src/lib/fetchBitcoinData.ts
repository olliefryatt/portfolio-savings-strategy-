export async function fetchBitcoinData(fromDate: string) {
  const from = Math.floor(new Date(fromDate).getTime() / 1000);
  const to = Math.floor(Date.now() / 1000);

  const res = await fetch(`/api/bitcoin?from=${from}&to=${to}`);

  if (!res.ok) {
    const errorText = await res.text();
    console.error("Backend error:", errorText);
    throw new Error("Failed to fetch Bitcoin data");
  }

  return await res.json();
}