export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <p className="text-xs uppercase tracking-wide text-sarokar-terracotta mb-2">About Sarokar</p>
      <h1 className="font-serif text-4xl text-govblue-dark mb-6">सरोकार — Everyone's stake in policy</h1>

      <p className="text-ink/70 leading-relaxed mb-5">
        Sarokar is a structured e-Consultation platform built in support of Nepal's Digital Nepal
        Framework and its e-Consultation initiative. It gives government departments a way to
        publish draft policies for public comment, and gives citizens a direct channel to weigh in
        on the decisions that affect them — with every submission automatically read, categorized,
        and counted rather than left in an inbox.
      </p>

      <h2 className="font-serif text-xl text-govblue-dark mt-10 mb-3">Legal and policy basis</h2>
      <p className="text-ink/70 leading-relaxed mb-5">
        Article 27 of the Constitution of Nepal guarantees every citizen the right to information
        on matters of public concern, and the Constitution's Directive Principles (Part 4) commit
        the state to inclusive, participatory governance. The Digital Nepal Framework operationalizes
        that commitment for policymaking specifically through its e-Consultation initiative, which
        this platform implements as a working prototype.
      </p>

      <div className="border border-sarokar-gold/40 bg-sarokar-gold/5 rounded-lg p-5 mb-5">
        <p className="text-sm text-ink/80 leading-relaxed">
          <span className="font-semibold text-govblue-dark">Not every policy is opened for public consultation.</span>{' '}
          Draft ordinances that touch national security, ongoing legal proceedings, confidential
          cabinet deliberations, or matters restricted by other law are handled through internal
          government channels and are not published here. Sarokar covers the category of draft
          policy that departments choose to open for structured public input — it is a tool for
          that category, not a replacement for every government decision-making process.
        </p>
      </div>

      <h2 className="font-serif text-xl text-govblue-dark mt-10 mb-3">How it works</h2>
      <ol className="space-y-3 text-ink/70">
        <li><span className="font-semibold text-govblue-dark">1. A department publishes a draft.</span> A policy officer opens a consultation with a defined comment window, optionally broken into clauses.</li>
        <li><span className="font-semibold text-govblue-dark">2. Citizens submit feedback.</span> A short form captures a stance (support/oppose/neutral), an optional clause reference, and a comment.</li>
        <li><span className="font-semibold text-govblue-dark">3. The system analyzes it instantly.</span> Every submission is sentiment-scored, auto-categorized by theme, and checked against recent submissions for duplication — no manual reading required.</li>
        <li><span className="font-semibold text-govblue-dark">4. Officers see the aggregate picture.</span> A live dashboard shows stance breakdowns, volume over time, and top themes, exportable as a briefing document.</li>
        <li><span className="font-semibold text-govblue-dark">5. The department reports back.</span> Once the consultation closes, a public transparency page publishes the results and the department's official response — closing the loop.</li>
      </ol>

      <h2 className="font-serif text-xl text-govblue-dark mt-10 mb-3">Beyond policy feedback</h2>
      <p className="text-ink/70 leading-relaxed">
        Not every concern fits the shape of a policy comment. The{' '}
        <a href="/grievances" className="text-govblue-dark underline">Grievance Portal</a> gives
        citizens a separate channel for administrative complaints — service quality, delays,
        mismanagement — that a department can track and respond to individually.
      </p>
    </div>
  );
}
