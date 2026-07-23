import { LayoutDashboard } from 'lucide-react';

function Board() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <LayoutDashboard className="h-5 w-5 text-indigo-400" />
          <h1 className="text-lg font-semibold">TaskFlow</h1>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-indigo-400">
          Hoş geldiniz
        </p>
        <h2 className="mb-4 text-3xl font-bold">Panolarınız</h2>
        <p className="max-w-md text-slate-400">
          Giriş başarılı. Kanban panolarınız burada listelenecek.
        </p>
      </main>
    </div>
  );
}

export default Board;
