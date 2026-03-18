import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b shadow-sm">
        <Link className="flex items-center justify-center font-bold text-2xl tracking-tighter text-primary" href="/">
          PreICFES Pro
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 flex items-center">
            Ingresar
          </Link>
        </nav>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-24 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 drop-shadow-sm">
            Simulacros Pre-ICFES Inteligentes
          </h1>
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
            Prepárate para la prueba saber 11 con simulacros personalizados, calificación automática y retroalimentación para Matemáticas, Ciencias, Sociales y Lectura Crítica.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="text-lg font-semibold px-8 shadow-lg">
              <Link href="/login">Comenzar Ahora</Link>
            </Button>
          </div>
        </div>
      </main>
      <footer className="py-6 w-full shrink-0 border-t flex flex-col sm:flex-row items-center justify-center px-4 md:px-6">
        <p className="text-xs text-muted-foreground">
          © 2024 PreICFES Pro. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
