import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl flex-1">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">Privacy</h1>
        <p className="text-gray-500 uppercase text-sm tracking-wide mb-12">Last updated April 2026</p>

        <section className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">What we collect</h2>
            <p>
              When you create an account, we store the username, email address, and (if you signed up
              with email + password) a salted, hashed password. If you sign in with Google, we store
              your Google account ID and the email Google reports.
            </p>
            <p className="mt-3">
              When you create a lineup, we store the title, description, artists you picked, tags,
              comments, and likes. Anonymous lineups are stored against a temporary guest account.
            </p>
            <p className="mt-3">
              We use Google Analytics to understand how the site is used. Google sets cookies and
              receives anonymized traffic data. You can block this with any standard ad blocker.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">What we do not collect</h2>
            <p>
              No payment data. No location tracking. No third-party advertising trackers beyond
              Google Analytics. We do not sell your data to anyone.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">Where it lives</h2>
            <p>
              Account and lineup data is stored in a managed Turso database. Artist images and
              metadata come from the Spotify Web API and are cached server-side.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">Deleting your data</h2>
            <p>
              Email <a href="mailto:hello@thediffraction.com" className="text-white underline">hello@thediffraction.com</a>{' '}
              and we will delete your account and all lineups you have created.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">Changes</h2>
            <p>
              If we change anything material on this page we will note it in the "last updated" date
              at the top.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
