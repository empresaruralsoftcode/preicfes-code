import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-10 h-16 flex items-center border-b border-white/10 bg-white/70 backdrop-blur-xl">
        <Link className="flex items-center gap-2 font-extrabold text-xl tracking-tight" href="/">
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PreICFES</span>
          <span className="text-slate-800">Pro</span>
        </Link>
        <nav className="ml-auto flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors hidden sm:inline-block">
            Características
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm" className="rounded-full px-5 font-semibold border-slate-200 hover:border-primary hover:text-primary transition-all">
              Iniciar Sesión
            </Button>
          </Link>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <main className="flex-1">
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 px-6">
          {/* Background decorative blobs */}
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-float pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
          <div className="absolute top-40 right-10 w-48 h-48 bg-violet-400/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '4s' }} />
          
          <div className="relative max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-100 bg-blue-50/80 text-blue-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              Plataforma de simulacros Pre-ICFES
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08]">
              Prepárate para el{" "}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent animate-gradient">
                ICFES
              </span>
              {" "}con confianza
            </h1>
            
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Simulacros personalizados con calificación automática e instantánea, retroalimentación detallada y seguimiento de progreso para Matemáticas, Ciencias, Sociales y Lectura Crítica.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-base font-semibold px-8 py-6 rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:scale-[1.02]">
                <Link href="/login">Comenzar Ahora →</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base font-semibold px-8 py-6 rounded-xl border-slate-200 hover:bg-slate-50 transition-all">
                <Link href="#features">Ver Características</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section id="features" className="py-20 md:py-28 px-6 bg-slate-50/80">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 animate-fade-in-up">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Todo lo que necesitas para triunfar
              </h2>
              <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
                Herramientas poderosas diseñadas para maximizar tu preparación.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Simulacros Cronometrados</h3>
                <p className="text-slate-500 leading-relaxed text-sm">Practica bajo presión con nuestros simulacros cronometrados que reflejan las condiciones reales del examen ICFES.</p>
              </div>
              
              {/* Feature 2 */}
              <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Calificación Instantánea</h3>
                <p className="text-slate-500 leading-relaxed text-sm">Obtén resultados inmediatos al finalizar tu prueba con un desglose detallado de cada pregunta correcta e incorrecta.</p>
              </div>
              
              {/* Feature 3 */}
              <div className="group relative bg-white rounded-2xl p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:border-violet-100 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center mb-5 group-hover:bg-violet-100 transition-colors">
                  <svg className="w-6 h-6 text-violet-600" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Reportes en PDF</h3>
                <p className="text-slate-500 leading-relaxed text-sm">Descarga reportes completos en PDF con el puntaje, respuestas y retroalimentación lista para imprimir o compartir.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-20 md:py-28 px-6">
          <div className="max-w-3xl mx-auto text-center relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-3xl opacity-10 scale-105" />
            <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-3xl p-12 md:p-16 text-white shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
                ¿Listo para Mejorar tu Puntaje?
              </h2>
              <p className="text-blue-100 text-lg mb-8 max-w-lg mx-auto">
                Únete a la plataforma y comienza a practicar con simulacros diseñados por docentes expertos.
              </p>
              <Button asChild size="lg" className="bg-white text-blue-700 font-bold px-10 py-6 rounded-xl text-base hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                <Link href="/login">Acceder a la Plataforma</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="py-8 border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PreICFES Pro</span>
          </div>
          <p className="text-xs text-slate-400">
            © 2025 PreICFES Pro. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
