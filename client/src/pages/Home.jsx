import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6">
      <section className="py-20 grid md:grid-cols-5 gap-12 items-end">
        <div className="md:col-span-3">
          <p className="text-sarokar-terracotta text-sm mb-4">Digital Nepal Framework · e-Consultation</p>
          <h1 className="font-serif text-5xl md:text-6xl leading-[1.05] text-govblue-dark mb-6">
            Every comment on a draft policy, read and counted.
          </h1>
          <p className="text-lg text-ink/70 max-w-xl leading-relaxed">
            Public feedback on draft ordinances is usually scattered across emails, PDFs and
            physical hearings, with no structured way to see what people actually think. Sarokar
            gives policymakers a live, quantified view of public sentiment — and gives citizens a
            direct, transparent channel into the drafting process.
          </p>
          <div className="mt-10 flex gap-4">
            <Link
              to="/consultations"
              className="bg-govblue-dark text-paper px-6 py-3 rounded hover:bg-govblue transition-colors"
            >
              Browse open consultations
            </Link>
            <Link
              to="/register"
              className="border border-govblue-dark/30 text-govblue-dark px-6 py-3 rounded hover:bg-govblue-dark/5 transition-colors"
            >
              Create a citizen account
            </Link>
          </div>
        </div>

        <div className="md:col-span-2 border-l border-sarokar-mist pl-8">
          <dl className="space-y-6">
            <div>
              <dt className="text-sm text-ink/50">The gap today</dt>
              <dd className="font-serif text-xl mt-1">Feedback collected informally, never analyzed at scale.</dd>
            </div>
            <div>
              <dt className="text-sm text-ink/50">The response</dt>
              <dd className="font-serif text-xl mt-1">Structured submission, auto-categorized and scored on arrival.</dd>
            </div>
            <div>
              <dt className="text-sm text-ink/50">The outcome</dt>
              <dd className="font-serif text-xl mt-1">A dashboard a policymaker can read in minutes, not weeks.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="py-16 border-t border-sarokar-mist grid md:grid-cols-3 gap-10">
        <div>
          <h2 className="font-serif text-xl text-govblue-dark mb-2">Citizens submit</h2>
          <p className="text-ink/70 text-sm leading-relaxed">
            Pick a stance, tag a clause, write a comment — a two-minute form, not a bureaucratic
            ordeal.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-xl text-govblue-dark mb-2">The system analyzes</h2>
          <p className="text-ink/70 text-sm leading-relaxed">
            Every submission is automatically themed, sentiment-scored, and checked against
            recent comments for duplication or spam.
          </p>
        </div>
        <div>
          <h2 className="font-serif text-xl text-govblue-dark mb-2">Officers respond</h2>
          <p className="text-ink/70 text-sm leading-relaxed">
            Once a consultation closes, officers publish what changed and why — closing the loop
            publicly.
          </p>
        </div>
      </section>
    </div>
  );
}
