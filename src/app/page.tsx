import { AuthCard } from "@/components/auth-card";

const flow = [
  ["01", "Bring the garment", "Add a product shot and its size chart."],
  ["02", "Set the body", "Use a model photo with a few essential measurements."],
  ["03", "See the fit", "Inspect a garment-only virtual try-on before committing."],
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f1ed] text-[#17221f]">
      <div className="relative mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#17221f]/15 py-5 sm:py-7">
          <a className="group inline-flex items-center gap-2" href="#top">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#17221f] text-sm font-bold text-[#f3f1ed] transition-transform duration-300 group-hover:rotate-12">A</span>
            <span className="text-sm font-bold tracking-[-0.03em]">Atelier</span>
          </a>
          <nav aria-label="Primary navigation" className="hidden items-center gap-7 text-sm font-medium text-[#52615b] sm:flex">
            <a className="transition hover:text-[#17221f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3c6658]" href="#method">How it works</a>
            <a className="transition hover:text-[#17221f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#3c6658]" href="#access">Try the studio</a>
          </nav>
          <a className="rounded-full border border-[#17221f] px-4 py-2 text-sm font-semibold transition hover:bg-[#17221f] hover:text-[#f3f1ed]" href="#access">Sign in</a>
        </header>

        <section className="grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[1.07fr_0.93fr] lg:gap-16 lg:py-24" id="top">
          <div className="max-w-3xl">
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[#3c6658]"><span className="h-px w-8 bg-[#3c6658]" />Intelligent virtual try-on</p>
            <h1 className="mt-6 text-[clamp(3.6rem,8vw,7.6rem)] font-semibold leading-[0.86] tracking-[-0.075em] text-[#17221f]">The right fit,<br />before the <em className="font-normal text-[#d65738]">first wear.</em></h1>
            <p className="mt-8 max-w-xl text-lg leading-8 text-[#52615b] sm:text-xl">Atelier turns a model, a garment, and a size chart into a clear fitting decision. No reshoots. No guesswork. Just the evidence your customer needs.</p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <a className="inline-flex items-center gap-3 rounded-full bg-[#17221f] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#2d4039] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#9db8ac]" href="#access">Start a fitting session <span aria-hidden="true" className="text-lg leading-none">↗</span></a>
              <a className="text-sm font-bold text-[#17221f] underline decoration-[#d65738] decoration-2 underline-offset-4 transition hover:text-[#d65738]" href="#method">See the method</a>
            </div>
            <div className="mt-14 flex items-center gap-4 border-t border-[#17221f]/15 pt-5 text-xs text-[#52615b]">
              <div className="flex -space-x-2" aria-label="Sample fitting profiles">{["bg-[#d65738]", "bg-[#d2b690]", "bg-[#597c70]", "bg-[#263c55]"].map((color) => <span className={`h-7 w-7 rounded-full border-2 border-[#f3f1ed] ${color}`} key={color} />)}</div>
              <p><strong className="font-bold text-[#17221f]">Garment-first rendering</strong> keeps the person recognizably themselves.</p>
            </div>
          </div>
          <FitCanvas />
        </section>

        <section className="border-y border-[#17221f]/15 py-6" aria-label="Capabilities"><div className="grid gap-4 text-center text-xs font-bold uppercase tracking-[0.15em] text-[#52615b] sm:grid-cols-3 sm:gap-0"><p>Garment-only edit</p><p className="sm:border-x sm:border-[#17221f]/15">Size chart aware</p><p>Fit verdict included</p></div></section>

        <section className="grid gap-10 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:py-28" id="method">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3c6658]">The process</p><h2 className="mt-4 max-w-sm text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-5xl">A better fitting room is built on context.</h2></div>
          <ol className="divide-y divide-[#17221f]/15 border-t border-[#17221f]/15">{flow.map(([number, title, description]) => <li className="grid gap-4 py-6 sm:grid-cols-[5rem_1fr_1.2fr] sm:items-baseline sm:gap-6" key={number}><span className="font-mono text-xs font-bold text-[#a83b27]">{number}</span><h3 className="text-xl font-bold tracking-[-0.035em]">{title}</h3><p className="text-sm leading-6 text-[#52615b]">{description}</p></li>)}</ol>
        </section>

        <section className="mb-8 overflow-hidden rounded-[2rem] bg-[#17221f] px-6 py-10 text-[#f5f3ee] sm:px-10 sm:py-14" id="access">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a9cab7]">Enter the studio</p><h2 className="mt-4 max-w-md text-4xl font-semibold leading-[0.95] tracking-[-0.055em] sm:text-5xl">Make your next product page feel more certain.</h2><p className="mt-6 max-w-md leading-7 text-[#bdc9c2]">Sign in to start a fitting session, or create an account to make your first garment decision.</p><div className="mt-9"><AuthCard /></div></div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-4 py-7 text-xs text-[#52615b]"><p>Atelier / virtual fitting intelligence</p><p>Designed for considered wardrobes.</p></footer>
      </div>
    </main>
  );
}

function FitCanvas() {
  return (
    <div className="relative mx-auto w-full max-w-xl" aria-label="Example fit analysis" role="img">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-[#d65738]/45 sm:h-52 sm:w-52" />
      <div className="absolute -bottom-4 -left-3 h-32 w-32 rounded-full bg-[#d9ded4]" />
      <div className="relative overflow-hidden rounded-[2rem] border border-[#17221f]/20 bg-[#dce2d8] p-3 shadow-[16px_18px_0_#d65738] sm:p-5">
        <div className="relative min-h-[31rem] overflow-hidden rounded-[1.45rem] bg-[#263c55] sm:min-h-[35rem]">
          <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 py-5 text-[0.66rem] font-bold uppercase tracking-[0.14em] text-white/80"><span>Model view</span><span>1:1 profile</span></div>
          <div className="absolute -left-20 top-28 h-72 w-72 rounded-full bg-[#597c70] opacity-80 blur-[1px]" /><div className="absolute -right-12 bottom-0 h-80 w-80 rounded-full border-[28px] border-[#e0b565] opacity-90" />
          <div className="absolute bottom-0 left-1/2 h-[76%] w-[48%] -translate-x-1/2 rounded-t-[48%] bg-[#d2a981]"><div className="absolute -top-[23%] left-1/2 h-36 w-28 -translate-x-1/2 rounded-[48%] bg-[#c9946e]" /><div className="absolute -top-[17%] left-1/2 h-16 w-24 -translate-x-1/2 rounded-t-[45%] bg-[#1a242b]" /><div className="absolute left-1/2 top-20 h-4 w-3 -translate-x-1/2 rounded-full bg-[#a87056]" /><div className="absolute left-[4%] top-[25%] h-[55%] w-[92%] rounded-t-[38%] bg-[#ede7db] shadow-[inset_0_0_0_2px_rgba(23,34,31,0.15)]" /><div className="absolute left-[4%] top-[33%] h-px w-[92%] bg-[#d65738]" /><div className="absolute left-[4%] top-[39%] h-px w-[92%] bg-[#17221f]/20" /></div>
          <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-white/25 text-[0.65rem] font-bold uppercase tracking-[0.1em] backdrop-blur-sm"><div className="bg-[#17221f]/75 px-3 py-3 text-white"><span className="block text-white/55">Size</span><strong className="mt-1 block text-base">M</strong></div><div className="bg-[#f5f3ee]/90 px-3 py-3 text-[#17221f]"><span className="block text-[#52615b]">Verdict</span><strong className="mt-1 block text-sm">Easy fit</strong></div></div>
        </div>
        <div className="absolute -right-2 top-[39%] w-36 rotate-[5deg] rounded-xl bg-[#f5f3ee] p-3 shadow-lg sm:right-0 sm:w-44"><p className="text-[0.6rem] font-bold uppercase tracking-[0.13em] text-[#597c70]">Chest allowance</p><div className="mt-2 flex items-end justify-between"><strong className="text-2xl tracking-[-0.06em]">+8cm</strong><span className="text-xs text-[#52615b]">comfort</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#dce2d8]"><div className="h-full w-2/3 rounded-full bg-[#d65738]" /></div></div>
      </div>
    </div>
  );
}
