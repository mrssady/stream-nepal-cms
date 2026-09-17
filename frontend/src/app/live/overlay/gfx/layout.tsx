import "./gfx.css";

export default function LiveGfxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="gfx-stage">{children}</div>;
}