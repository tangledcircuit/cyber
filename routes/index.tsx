import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Cyber Clock - Real-time Profitability & Team Communication</title>
        <meta name="description" content="Cyber Clock - Real-time profitability tracking, profit sharing, and team communication platform" />
      </Head>
      <div class="min-h-screen bg-gray-900 text-white">
        <nav class="bg-gray-800 p-4">
          <div class="container mx-auto flex justify-between items-center">
            <h1 class="text-2xl font-bold">Cyber Clock</h1>
            <div>
              <a href="/login" class="text-white hover:text-indigo-400 px-4 py-2">Login</a>
              <a href="/register" class="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md">Register</a>
            </div>
          </div>
        </nav>

        <main class="container mx-auto px-4 py-16">
          <div class="text-center max-w-3xl mx-auto">
            <h2 class="text-5xl font-bold mb-8">
              Transform Your Team's Productivity
            </h2>
            <p class="text-xl text-gray-300 mb-12">
              Real-time profitability tracking, seamless profit sharing, and instant team communication. 
              Pay by the second, secure by design.
            </p>
            <div class="space-x-4">
              <a href="/register" class="bg-indigo-600 hover:bg-indigo-700 px-8 py-4 rounded-md text-lg font-semibold">
                Get Started
              </a>
              <a href="#features" class="border border-white hover:border-indigo-400 px-8 py-4 rounded-md text-lg font-semibold">
                Learn More
              </a>
            </div>
          </div>

          <div id="features" class="grid md:grid-cols-3 gap-8 mt-24">
            <div class="bg-gray-800 p-6 rounded-lg">
              <h3 class="text-xl font-bold mb-4">Real-time Profitability</h3>
              <p class="text-gray-300">Track your team's productivity and profitability in real-time with precise second-by-second metrics.</p>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg">
              <h3 class="text-xl font-bold mb-4">Instant Communication</h3>
              <p class="text-gray-300">Keep your team connected with integrated real-time messaging and collaboration tools.</p>
            </div>
            <div class="bg-gray-800 p-6 rounded-lg">
              <h3 class="text-xl font-bold mb-4">Secure by Design</h3>
              <p class="text-gray-300">Enterprise-grade security ensures your data and communications are protected at all times.</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
