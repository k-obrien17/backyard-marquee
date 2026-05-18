import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-3xl flex-1">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">Terms</h1>
        <p className="text-gray-500 uppercase text-sm tracking-wide mb-12">Last updated May 2026</p>

        <section className="space-y-8 text-gray-300 leading-relaxed">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">The deal</h2>
            <p>
              Backyard Marquee is a free hobby site for building and sharing imaginary concert
              lineups. Use it, have fun, do not abuse it.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">Who can use it</h2>
            <p>
              You must be at least 13 years old to create an account. If you are under 13, please
              do not sign up — we are not built to handle data from kids and US law (COPPA) does
              not let us collect it.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">Your content</h2>
            <p>
              You own the lineups, comments, and tags you create. By posting them publicly you grant
              us a non-exclusive license to display them on the site and in OG previews when other
              people share your lineup links. You can delete your content at any time.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">Don't</h2>
            <ul className="list-disc list-inside space-y-2 mt-3">
              <li>Post hate, harassment, or anything illegal.</li>
              <li>Spam lineups, comments, or fake accounts.</li>
              <li>Try to break the site, scrape it at scale, or interfere with other users.</li>
              <li>Impersonate a real artist, label, or promoter in a way that misleads people.</li>
            </ul>
            <p className="mt-3">
              We can remove content and lock accounts that break these rules.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">No warranty</h2>
            <p>
              The site is provided as-is. We make no promise of uptime, durability, or fitness for
              any particular purpose. Do not store anything here you cannot afford to lose.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">Artist data</h2>
            <p>
              Artist names, images, and metadata come from Spotify and remain the property of their
              respective rights holders. Backyard Marquee is not affiliated with Spotify, any artist,
              label, or venue.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold uppercase tracking-wide text-white mb-3">Contact</h2>
            <p>
              Questions, takedown requests, or bug reports:{' '}
              <a href="mailto:hello@thediffraction.com" className="text-white underline">hello@thediffraction.com</a>.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
