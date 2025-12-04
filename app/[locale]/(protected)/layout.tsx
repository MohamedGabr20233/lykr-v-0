export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Future: Add authentication check / middleware redirect here
  return <>{children}</>;
}
