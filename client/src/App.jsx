import { useQuery } from '@tanstack/react-query';
import { fetchHealth } from './lib/api';

function App() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          TaskFlow
        </p>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Kanban görev yönetimi
        </h1>
        <p className="mb-8 max-w-xl text-slate-400">
          React, Vite, Tailwind CSS ve TanStack Query ile kurulmuş modern bir arayüz.
        </p>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-4 shadow-xl">
          {isLoading && <p className="text-slate-300">API bağlantısı kontrol ediliyor...</p>}
          {isError && (
            <p className="text-rose-400">
              API bağlantısı kurulamadı. Sunucunun çalıştığından emin olun.
            </p>
          )}
          {data && (
            <p className="text-emerald-400">
              {data.message} — Veritabanı: {data.database}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
