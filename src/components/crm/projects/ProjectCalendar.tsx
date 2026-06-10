import type { Task } from '@/types/crm';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, format, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProjectCalendarProps {
    tasks: Task[];
}

export function ProjectCalendar({ tasks }: ProjectCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const getTasksForDay = (date: Date) => {
        return tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), date));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium capitalize">
                    {format(currentDate, 'MMMM yyyy', { locale: es })}
                </h3>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={prevMonth}><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden shadow-sm">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                    <div key={day} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground uppercase">
                        {day}
                    </div>
                ))}

                {/* Empty cells for start padding could be added here for perfect alignment */}
                {/* For simplicity, we just render days of month */}

                {days.map(day => {
                    const dayTasks = getTasksForDay(day);
                    return (
                        <div key={day.toString()} className={`min-h-[100px] bg-card p-2 border-t border-r relative hover:bg-muted/50 transition-colors ${isToday(day) ? 'bg-brand-blue/5' : ''}`}>
                            <span className={`text-sm font-medium ${isToday(day) ? 'text-brand-blue' : 'text-muted-foreground'}`}>
                                {format(day, 'd')}
                            </span>
                            <div className="mt-1 space-y-1">
                                {dayTasks.map(task => (
                                    <div key={task.id} className={`text-[10px] px-1.5 py-0.5 rounded truncate border ${task.isLaunchEvent ? 'bg-purple-500/10 border-purple-500/30 text-purple-600 font-medium' :
                                        'bg-muted border-border text-muted-foreground'
                                        }`}>
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500/10 border border-purple-500/30 rounded" />
                    <span>Lanzamiento / Publicación</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-muted border border-border rounded" />
                    <span>Tarea estándar</span>
                </div>
            </div>
        </div>
    );
}
