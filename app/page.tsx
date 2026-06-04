import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 text-green-500 font-mono p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full border-2 border-green-500/50 rounded-xl p-8 bg-black shadow-[0_0_30px_rgba(0,255,0,0.15)] text-center">
        
        <div className="text-6xl mb-4">🕵️‍♂️</div>
        <h1 className="text-4xl font-bold tracking-widest mb-2 uppercase">Cuartel General</h1>
        <p className="text-green-400/70 mb-10">Agencia de Inteligencia Estudiantil</p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Tarjeta de Misión 1 */}
          <Link 
            href="/misiones/calculo-007"
            className="group block border border-green-500/30 rounded-lg p-6 hover:bg-green-500/10 hover:border-green-400 transition-all duration-300"
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">💣</div>
            <h2 className="text-xl font-bold mb-2">Operación 007</h2>
            <p className="text-sm text-green-400/60">Cálculo mental táctico bajo presión. Desactiva la amenaza.</p>
          </Link>

          {/* Espacio para futuras misiones */}
          <div className="border border-neutral-800 rounded-lg p-6 flex flex-col items-center justify-center opacity-50 bg-neutral-900">
            <div className="text-4xl mb-3 grayscale">🔒</div>
            <h2 className="text-xl font-bold mb-2 text-neutral-500">Archivo Clasificado</h2>
            <p className="text-sm text-neutral-600">Próximamente...</p>
          </div>
        </div>

      </div>
    </main>
  );
}