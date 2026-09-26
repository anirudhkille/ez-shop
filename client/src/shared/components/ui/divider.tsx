export default function Divider() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="bg-brand-border h-px flex-1" />
      <span className="font-body text-muted-foreground text-xs tracking-widest uppercase">
        Or
      </span>
      <div className="bg-brand-border h-px flex-1" />
    </div>
  );
}
