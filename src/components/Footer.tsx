'use client';

export default function Footer() {
  return (
      <footer className="bg-gradient-to-r from-pink-900 via-rose-800 to-purple-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-pink-200 to-rose-200 bg-clip-text text-transparent">LearnHub</h3>
              <p className="text-pink-200">Empowering learners worldwide since 2023</p>
            </div>
          </div>
        </div>
      </footer>
  );
}
