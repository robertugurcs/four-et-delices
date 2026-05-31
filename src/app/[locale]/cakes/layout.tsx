import { SiteHeader } from "@/components/site-header/SiteHeader";
import "@/components/our-cakes/our-cakes.css";

export default function CakesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="our-cakes-page m-0 w-full max-w-full p-0">
      <SiteHeader />
      <div className="our-cakes-shell">{children}</div>
    </main>
  );
}
