import ProductOwnerSubNav from "./components/ProductOwnerSubNav";

export default function ProductOwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <ProductOwnerSubNav />
      {children}
    </div>
  );
}
