import { createClient } from '@/utils/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteUserAction, assignComponentAction, removeComponentAction, createUserByAdminAction } from './admin-actions'

export default async function AdminDashboard({ userId }: { userId: string }) {
  const supabase = await createClient()

  // Fetch all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  const students = profiles?.filter(p => p.role === 'student') || []
  const teachers = profiles?.filter(p => p.role === 'teacher') || []

  // Fetch all components
  const { data: components } = await supabase.from('components').select('*')

  // Fetch teacher_components to know which teacher has which subject
  const { data: teacherComponents } = await supabase.from('teacher_components').select('*')

  return (
    <div className="space-y-10 relative mt-4">
      {/* Background Decorators for Glassmorphism effect */}
      <div className="fixed top-20 left-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 pointer-events-none -z-10"></div>
      <div className="fixed top-20 right-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 pointer-events-none -z-10"></div>
      <div className="fixed -bottom-8 left-1/3 w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 pointer-events-none -z-10"></div>

      <div className="relative z-10 px-2 lg:px-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600">
          Panel de Control
        </h2>
        <p className="text-slate-600 text-lg mt-2 font-medium">
          Gestión avanzada de personal, estudiantes y asignaturas.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 relative z-10 px-2 lg:px-4">
        
        {/* Module: Teachers */}
        <div className="flex flex-col overflow-hidden rounded-3xl bg-white/50 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="p-8 pb-4">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Docentes <span className="text-indigo-600 ml-1">({teachers.length})</span></h3>
             </div>
             <p className="text-sm text-slate-500 font-medium ml-1">Administra a los docentes y las áreas que evalúan.</p>
          </div>
          
          <div className="flex-1 p-8 pt-4 space-y-5 overflow-y-auto max-h-[600px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-4">
             {teachers.map(teacher => {
               const assignedCompIds = teacherComponents?.filter(tc => tc.teacher_id === teacher.id).map(tc => tc.component_id) || []
               
               return (
                 <div key={teacher.id} className="group relative p-6 rounded-2xl bg-white/70 hover:bg-white transition-all duration-300 border border-white/80 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]">
                    <div className="flex justify-between items-start mb-5">
                       <div>
                         <p className="font-bold text-lg text-slate-800 leading-tight">{teacher.name}</p>
                         <p className="text-[11px] font-bold text-slate-400 bg-slate-100/50 px-2.5 py-1 rounded-md inline-block mt-2 tracking-wide uppercase border border-slate-200/50">{teacher.email || 'Docente'}</p>
                       </div>
                       <form action={deleteUserAction}>
                          <input type="hidden" name="userId" value={teacher.id} />
                          <Button variant="destructive" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 text-red-600 hover:bg-red-500 hover:text-white shadow-none h-8 px-3 rounded-lg" type="submit">Eliminar</Button>
                       </form>
                    </div>

                    <div className="pt-4 border-t border-slate-200/60">
                      <p className="text-[11px] font-bold text-indigo-400/80 uppercase tracking-widest mb-3">Áreas Asignadas</p>
                      <div className="flex flex-wrap gap-2">
                        {components?.map(comp => {
                           const isAssigned = assignedCompIds.includes(comp.id)
                           return (
                             <form key={comp.id} action={isAssigned ? removeComponentAction : assignComponentAction}>
                                <input type="hidden" name="teacherId" value={teacher.id} />
                                <input type="hidden" name="componentId" value={comp.id} />
                                <Button 
                                  variant={isAssigned ? "default" : "outline"}
                                  size="sm"
                                  className={`rounded-xl h-8 px-3 text-xs font-semibold transition-all ${isAssigned ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200/50" : "bg-white/50 hover:bg-white border-slate-200 text-slate-500 hover:text-indigo-600"}`}
                                  type="submit"
                                >
                                  {comp.name} {isAssigned && <span className="ml-1.5 opacity-70">✓</span>}
                                </Button>
                             </form>
                           )
                        })}
                      </div>
                    </div>
                 </div>
               )
             })}
          </div>
          
          <div className="p-8 bg-gradient-to-t from-slate-100/90 to-slate-50/40 border-t border-white/60">
             <form action={createUserByAdminAction} className="space-y-4">
               <h4 className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-100/50 inline-block px-3 py-1 rounded-full">✚ Registrar Nuevo Docente</h4>
               <input type="hidden" name="role" value="teacher" />
               <Input name="name" placeholder="Nombre completo" required className="bg-white/80 border-white/60 focus:bg-white focus:border-indigo-300 transition-colors rounded-xl h-12 shadow-sm" />
               <div className="grid grid-cols-2 gap-3">
                 <Input name="email" type="email" placeholder="Correo electrónico" required className="bg-white/80 border-white/60 focus:bg-white focus:border-indigo-300 transition-colors rounded-xl h-12 shadow-sm" />
                 <Input name="password" type="text" placeholder="Contraseña" required className="bg-white/80 border-white/60 focus:bg-white focus:border-indigo-300 transition-colors rounded-xl h-12 shadow-sm" />
               </div>
               <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 transition-all mt-2">
                 Crear Docente
               </Button>
             </form>
          </div>
        </div>

        {/* Module: Students */}
        <div className="flex flex-col overflow-hidden rounded-3xl bg-white/50 backdrop-blur-2xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]">
          <div className="p-8 pb-4">
             <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v7M5 9.5v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Estudiantes <span className="text-emerald-600 ml-1">({students.length})</span></h3>
             </div>
             <p className="text-sm text-slate-500 font-medium ml-1">Control general sobre los alumnos inscritos en la plataforma.</p>
          </div>
          
          <div className="flex-1 p-8 pt-4 space-y-4 overflow-y-auto max-h-[600px] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-4">
            {students.map(student => (
              <div key={student.id} className="group flex justify-between items-center p-4 rounded-2xl bg-white/70 hover:bg-white border border-white/80 transition-all duration-300 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)]">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-100 to-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm shadow-sm">
                       {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                       <p className="font-bold text-slate-800 leading-tight">{student.name}</p>
                       <p className="text-xs text-slate-400 font-medium mt-0.5">{student.email || 'Estudiante'}</p>
                    </div>
                 </div>
                 <form action={deleteUserAction}>
                    <input type="hidden" name="userId" value={student.id} />
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all h-8 px-3" type="submit">Borrar</Button>
                 </form>
              </div>
            ))}
            {students.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                   <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                </div>
                <p className="font-medium text-slate-500">No hay estudiantes activos.</p>
              </div>
            )}
          </div>
          
          <div className="p-8 bg-gradient-to-t from-slate-100/90 to-slate-50/40 border-t border-white/60">
             <form action={createUserByAdminAction} className="space-y-4">
               <h4 className="text-[11px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/50 inline-block px-3 py-1 rounded-full">✚ Registrar Nuevo Estudiante</h4>
               <input type="hidden" name="role" value="student" />
               <Input name="name" placeholder="Nombre completo" required className="bg-white/80 border-white/60 focus:bg-white focus:border-emerald-300 transition-colors rounded-xl h-12 shadow-sm" />
               <div className="grid grid-cols-2 gap-3">
                 <Input name="email" type="email" placeholder="Correo electrónico" required className="bg-white/80 border-white/60 focus:bg-white focus:border-emerald-300 transition-colors rounded-xl h-12 shadow-sm" />
                 <Input name="password" type="text" placeholder="Contraseña" required className="bg-white/80 border-white/60 focus:bg-white focus:border-emerald-300 transition-colors rounded-xl h-12 shadow-sm" />
               </div>
               <Button type="submit" className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-200 transition-all mt-2">
                 Crear Estudiante
               </Button>
             </form>
          </div>
        </div>
      </div>
    </div>
  )
}
