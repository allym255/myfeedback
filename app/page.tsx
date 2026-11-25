import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Feedback | Guest feedback by QR code for UAE restaurants',
  description:
    'Put a QR code on every table, get honest guest feedback in 30 seconds, and an instant alert when someone is unhappy. Free for 30 days, then $29 per branch per month.',
  openGraph: {
    title: 'My Feedback | Hear it from your guests first',
    description:
      'QR code guest feedback for restaurants, cafés and hotels in the UAE. Instant low-rating alerts and a weekly summary. Free for 30 days.',
    url: 'https://myfeedback.business',
    siteName: 'My Feedback',
    type: 'website',
  },
}

const CONTACT = 'dineboostuae@gmail.com'
const DEMO_LINK =
  'mailto:' +
  CONTACT +
  '?subject=' +
  encodeURIComponent('Demo request: My Feedback') +
  '&body=' +
  encodeURIComponent(
    'Hi, I would like a free 5-minute demo.\n\nRestaurant name:\nNumber of branches:\nPhone / WhatsApp:'
  )

// Decorative QR-style artwork (not a real, scannable code)
function QrArt() {
  const size = 17
  const cells: JSX.Element[] = []
  let seed = 7
  const rand = () => {
    seed = (seed * 48271) % 2147483647
    return seed / 2147483647
  }
  const inFinder = (x: number, y: number) =>
    (x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (inFinder(x, y)) continue
      if (rand() > 0.5) cells.push(<rect key={x + '-' + y} x={x} y={y} width="1" height="1" />)
    }
  }
  const finder = (ox: number, oy: number) => (
    <g key={ox + '_' + oy}>
      <rect x={ox} y={oy} width="7" height="7" />
      <rect x={ox + 1} y={oy + 1} width="5" height="5" fill="#fff" />
      <rect x={ox + 2} y={oy + 2} width="3" height="3" />
    </g>
  )
  return (
    <svg viewBox={'0 0 ' + size + ' ' + size} aria-hidden="true" className="mf-qr" fill="#0f3d36">
      {cells}
      {finder(0, 0)}
      {finder(size - 7, 0)}
      {finder(0, size - 7)}
    </svg>
  )
}

const steps = [
  {
    n: '1',
    title: 'Put the QR code on your tables',
    text: 'We make a QR code for every branch, with your logo and colours. Print it on tables, menus or receipts.',
  },
  {
    n: '2',
    title: 'Guests rate in 30 seconds',
    text: 'No app, no account, no name. They scan, rate their overall visit, speed, friendliness and cleanliness, and can add a comment.',
  },
  {
    n: '3',
    title: 'You hear about problems first',
    text: 'A low rating sends an email to your team straight away. Every Monday you get a summary of the week for each branch.',
  },
]

const features = [
  {
    title: 'Instant low-rating alerts',
    text: 'Unhappy guest? Your team gets an email with the rating and comment, so you can put it right before it becomes a public review.',
  },
  {
    title: 'Weekly summary every Monday',
    text: 'Average rating, how many guests replied compared with last week, the best comments and the ones that need attention.',
  },
  {
    title: 'A dashboard for every branch',
    text: 'See ratings for service speed, staff friendliness and cleanliness, and spot which shift or branch needs help.',
  },
  {
    title: 'Your brand, not ours',
    text: 'Your logo and brand colour on the feedback page, so guests see your restaurant, not a generic form.',
  },
  {
    title: 'Google reviews, the honest way',
    text: 'Every guest gets a link to review you on Google, not only the happy ones. Your reviews stay genuine and within Google’s rules.',
  },
  {
    title: 'Made for several branches',
    text: 'Each company gets its own private login. Owners see all their branches in one place.',
  },
]

const faqs = [
  {
    q: 'Do my guests need to download an app?',
    a: 'No. They scan the QR code with their phone camera and the feedback page opens in the browser. No account and no name needed.',
  },
  {
    q: 'Does this replace Google reviews?',
    a: 'No, it works alongside them. Guests get a link to review you on Google, and you get a private way to hear about problems first.',
  },
  {
    q: 'Who sets it up?',
    a: 'We do. We create your account, your branches and your QR codes, so you can print them and start collecting feedback right away.',
  },
  {
    q: 'What happens after the 30 free days?',
    a: 'It is $29 per branch per month. There is no contract, so you can stop whenever you like.',
  },
]

const css = `
html{scroll-behavior:smooth}
.mf{--green:#0f3d36;--green2:#16524a;--amber:#f2a900;--cream:#ffffff;--soft:#f6f8f7;--ink:#0d1b18;--muted:#56625e;--line:#e3e8e6;
  margin:0;background:var(--cream);color:var(--ink);min-height:100vh;
  font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;line-height:1.55}
.mf *{box-sizing:border-box}
.mf a{color:inherit}
.mf h1,.mf h2,.mf h3{font-family:inherit;font-weight:700;line-height:1.1;margin:0;letter-spacing:-0.025em}
.mf-wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.mf-nav{display:flex;align-items:center;justify-content:space-between;padding:18px 0}
.mf-logo{font-weight:800;font-size:20px;letter-spacing:-0.02em;text-decoration:none;color:var(--green)}
.mf-nav-r{display:flex;align-items:center;gap:18px;font-size:15px}
.mf-nav-r a{text-decoration:none;color:var(--muted)}
.mf-btn{display:inline-block;text-decoration:none;font-weight:600;padding:13px 22px;border-radius:12px;border:2px solid var(--green);background:var(--green);color:#fff!important;font-size:16px;transition:transform .15s,background .15s}
.mf-btn:hover{background:var(--green2);transform:translateY(-1px)}
.mf-btn.ghost{background:transparent;color:var(--green)!important}
.mf-btn.ghost:hover{background:#0f3d3610}
.mf-btn.amber{background:var(--amber);border-color:var(--amber);color:#2a2000!important}
.mf-btn.amber:hover{background:#ffbb1f}
.mf-nav-r .mf-btn{padding:9px 16px;font-size:14px;color:#fff}
.mf-hero{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center;padding:44px 0 72px}
.mf-pill{display:inline-block;background:#f2a90026;color:#7a5400;font-weight:600;font-size:13px;padding:6px 12px;border-radius:99px;margin-bottom:18px}
.mf-hero h1{font-size:clamp(34px,5.4vw,56px)}
.mf-hero p.lead{font-size:19px;color:var(--muted);margin:20px 0 28px;max-width:520px}
.mf-cta{display:flex;flex-wrap:wrap;gap:12px}
.mf-note{font-size:14px;color:var(--muted);margin-top:16px}
.mf-visual{position:relative;min-height:440px}
.mf-tent{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px 22px 18px;width:230px;text-align:center;box-shadow:0 18px 40px #0f3d3622;transform:rotate(-4deg);position:absolute;left:28px;top:96px;z-index:1}
.mf-tent b{display:block;font-size:17px;font-weight:700;color:var(--green);margin-bottom:10px}
.mf-qr{width:100%;height:auto;display:block}
.mf-tent small{display:block;margin-top:10px;color:var(--muted);font-size:13px}
.mf-phone{position:absolute;z-index:2;right:0;bottom:0;width:190px;background:#fff;border:6px solid #1c1c1a;border-radius:28px;padding:14px 12px;box-shadow:0 20px 44px #0003;transform:rotate(3deg)}
.mf-phone .top{display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px;margin-bottom:10px}
.mf-phone .dot{width:22px;height:22px;border-radius:50%;background:var(--green);display:inline-block}
.mf-phone .row{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:7px}
.mf-phone .st{color:var(--green);font-weight:700;font-size:12px}
.mf-phone .go{margin-top:12px;background:var(--green);color:#fff;text-align:center;border-radius:10px;padding:8px;font-size:12px;font-weight:600}
.mf-alert{position:absolute;z-index:3;left:0;top:0;width:250px;background:#fff;border:1px solid var(--line);border-left:5px solid #d64545;border-radius:14px;padding:12px 14px;box-shadow:0 14px 30px #0002;font-size:13px;transform:rotate(-2deg)}
.mf-alert b{display:block;color:#b83030;margin-bottom:2px}
.mf-alert i{color:var(--muted)}
.mf-alert em{display:block;font-style:normal;font-size:11px;color:var(--muted);margin-top:6px}
.mf-sec{padding:72px 0}
.mf-sec.white{background:var(--soft);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.mf-sec h2{font-size:clamp(28px,4vw,40px);text-align:center}
.mf-sub{text-align:center;color:var(--muted);max-width:560px;margin:14px auto 44px;font-size:17px}
.mf-grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
.mf-card{background:var(--soft);border:1px solid var(--line);border-radius:18px;padding:26px}
.mf-sec.white .mf-card{background:#fff}
.mf-card h3{font-size:19px;margin:12px 0 8px;letter-spacing:-0.015em}
.mf-card p{margin:0;color:var(--muted);font-size:16px}
.mf-num{display:inline-block;font-size:13px;font-weight:700;letter-spacing:.08em;color:var(--green);border-bottom:2px solid var(--amber);padding-bottom:4px}
.mf-feat{background:#fff}
.mf-price{background:var(--green);color:#fff}
.mf-price h2{color:#fff}
.mf-price .mf-sub{color:#cfe3de}
.mf-pcard{max-width:460px;margin:0 auto;background:#fff;color:var(--ink);border-radius:24px;padding:34px 30px;text-align:center}
.mf-amt{font-size:60px;letter-spacing:-0.03em;font-weight:700;color:var(--green);line-height:1}
.mf-amt small{font-size:18px;color:var(--muted);font-weight:500;letter-spacing:0}
.mf-free{display:inline-block;background:#f2a90026;color:#7a5400;font-weight:700;border-radius:99px;padding:6px 14px;font-size:14px;margin-bottom:14px}
.mf-list{list-style:none;padding:0;margin:22px 0 26px;text-align:left}
.mf-list li{padding:10px 0;font-size:16px;border-bottom:1px solid var(--line)}
.mf-list li:last-child{border-bottom:0}
.mf-faq{max-width:720px;margin:0 auto}
.mf-faq details{background:var(--soft);border:1px solid var(--line);border-radius:14px;padding:16px 20px;margin-bottom:12px}
.mf-faq summary{cursor:pointer;font-weight:600;font-size:17px;list-style:none}
.mf-faq summary::-webkit-details-marker{display:none}
.mf-faq summary:after{content:'+';float:right;color:var(--muted);font-weight:400}
.mf-faq details[open] summary:after{content:'−'}
.mf-faq p{margin:10px 0 0;color:var(--muted)}
.mf-final{background:var(--green);color:#fff;text-align:center;padding:72px 20px}
.mf-final h2{color:#fff;font-size:clamp(28px,4vw,40px);max-width:640px;margin:0 auto 14px}
.mf-final p{color:#cfe3de;margin:0 0 26px;font-size:18px}
.mf-foot{padding:28px 0;font-size:14px;color:var(--muted)}
.mf-foot .mf-wrap{display:flex;flex-wrap:wrap;gap:10px 22px;justify-content:space-between}
.mf-foot a{text-decoration:none;margin-right:16px}
@media (max-width:860px){
  .mf-hero{grid-template-columns:1fr;padding-top:24px}
  .mf-visual{min-height:460px;max-width:440px;margin:0 auto;width:100%}
  .mf-grid3{grid-template-columns:1fr}
  .mf-nav-r .hide-sm{display:none}
}
@media (max-width:420px){
  .mf-tent{width:200px}
  .mf-phone{width:160px}
  .mf-alert{width:210px}
}
`

export default function Home() {
  return (
    <div className="mf">
      <style>{css}</style>

      <div className="mf-wrap">
        <nav className="mf-nav">
          <a className="mf-logo" href="#top">
            My Feedback
          </a>
          <div className="mf-nav-r">
            <a className="hide-sm" href="#how">How it works</a>
            <a className="hide-sm" href="#pricing">Pricing</a>
            <Link href="/login">Log in</Link>
            <a className="mf-btn" href={DEMO_LINK}>Book a demo</a>
          </div>
        </nav>

        <header className="mf-hero" id="top">
          <div>
            <span className="mf-pill">Made for restaurants, cafés and hotels in the UAE</span>
            <h1>Hear it from your guests first, not from a bad review.</h1>
            <p className="lead">
              Put a QR code on every table. Guests rate their visit in 30 seconds. You get an instant alert when someone is unhappy, and a weekly summary of how each branch is doing.
            </p>
            <div className="mf-cta">
              <a className="mf-btn amber" href={DEMO_LINK}>Book a free demo</a>
              <a className="mf-btn ghost" href="#how">See how it works</a>
            </div>
            <p className="mf-note">Free for 30 days · No contract · We set everything up for you</p>
          </div>

          <div className="mf-visual" aria-hidden="true">
            <div className="mf-alert">
              <b>New 2-star rating</b>
              <i>“Waited too long for our food.”</i>
              <em>Example alert email · sent to your team instantly</em>
            </div>
            <div className="mf-tent">
              <b>How was your visit?</b>
              <QrArt />
              <small>Scan to rate · 30 seconds</small>
            </div>
            <div className="mf-phone">
              <div className="top"><span className="dot" /> Your Restaurant</div>
              <div className="row"><span>Overall</span><span className="st">5 / 5</span></div>
              <div className="row"><span>Speed</span><span className="st">4 / 5</span></div>
              <div className="row"><span>Friendly staff</span><span className="st">5 / 5</span></div>
              <div className="row"><span>Cleanliness</span><span className="st">5 / 5</span></div>
              <div className="go">Send feedback</div>
            </div>
          </div>
        </header>
      </div>

      <section className="mf-sec white" id="how">
        <div className="mf-wrap">
          <h2>Simple for your guests. Simple for you.</h2>
          <p className="mf-sub">Three steps from a QR code on the table to knowing exactly what to fix.</p>
          <div className="mf-grid3">
            {steps.map((s) => (
              <div className="mf-card" key={s.n}>
                <span className="mf-num">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mf-sec">
        <div className="mf-wrap">
          <h2>Everything you need, nothing you don’t</h2>
          <p className="mf-sub">No complicated software to learn. Scan, rate, get alerted, improve.</p>
          <div className="mf-grid3">
            {features.map((f) => (
              <div className="mf-card mf-feat" key={f.title}>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mf-sec mf-price" id="pricing">
        <div className="mf-wrap">
          <h2>One simple price</h2>
          <p className="mf-sub">Try it free for 30 days. Keep it only if it helps you.</p>
          <div className="mf-pcard">
            <span className="mf-free">30 days free</span>
            <div className="mf-amt">$29 <small>per branch / month</small></div>
            <ul className="mf-list">
              <li>QR code for every branch, with your logo and colours</li>
              <li>Instant email alerts for low ratings</li>
              <li>Weekly summary every Monday</li>
              <li>Dashboard for all your branches</li>
              <li>Google review link for every guest</li>
              <li>We set everything up for you</li>
              <li>No contract, stop whenever you like</li>
            </ul>
            <a className="mf-btn amber" href={DEMO_LINK}>Start your free month</a>
          </div>
        </div>
      </section>

      <section className="mf-sec">
        <div className="mf-wrap">
          <h2>Questions</h2>
          <p className="mf-sub">Short answers to what restaurant owners ask us most.</p>
          <div className="mf-faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mf-final">
        <h2>Ready to hear what your guests really think?</h2>
        <p>Book a free 5-minute demo and see it working for your restaurant.</p>
        <a className="mf-btn amber" href={DEMO_LINK}>Book a free demo</a>
      </section>

      <footer className="mf-foot">
        <div className="mf-wrap">
          <span>© 2026 My Feedback · myfeedback.business</span>
          <span>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/login">Log in</Link>
            <a href={'mailto:' + CONTACT}>{CONTACT}</a>
          </span>
        </div>
      </footer>
    </div>
  )
}
