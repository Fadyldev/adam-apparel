export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      <img
        src="https://images.pexels.com/photos/5698851/pexels-photo-5698851.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
        alt=""
        className="h-full w-full scale-105 object-cover blur-[5px]"
      />
      <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-sm" />
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-300/25 blur-3xl" />
      <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-emerald-200/35 blur-3xl" />
    </div>
  );
}
