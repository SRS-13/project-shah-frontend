'use client';

import { DndContext, useDraggable, useDroppable, PointerSensor, KeyboardSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { MessageCircle, Paperclip, Plus, GripVertical, Check } from 'lucide-react';
import { type Task, type TaskStatus } from '@/features/tasks/dashboard-data';

export const statuses: TaskStatus[] = ['To Do', 'In Progress', 'Done'];
export function Avatar({ name }: { name: string }) {
  return <span className="tf-avatar" title={name}>{name.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>;
}
export function TaskCard({ task, edit }: { task: Task; edit: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id });
  return <article ref={setNodeRef} className={`tf-task ${isDragging ? 'dragging' : ''}`} style={{ transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined }}>
    <div className="tf-task-title"><button onClick={() => edit(task)}>{task.title}</button><button className="tf-grip" aria-label={`Move ${task.title}`} {...listeners} {...attributes}><GripVertical size={16} /></button></div>
    <p>{task.description}</p>
    <div className="tf-tags"><span className={`tf-tag ${task.label.toLowerCase()}`}>{task.label}</span><span className={`tf-tag ${task.priority.toLowerCase()}`}>▥ {task.priority}</span></div>
    <footer><span><Avatar name={task.assignee} />{task.assignee}</span>{task.status === 'Done' ? <Check className="tf-done" size={18} /> : <span><MessageCircle size={14} />{task.comments}<Paperclip size={14} />{task.attachments}</span>}</footer>
  </article>;
}
function KanbanColumn({ status, tasks, edit, add }: { status: TaskStatus; tasks: Task[]; edit: (task: Task) => void; add: (status: TaskStatus) => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return <section ref={setNodeRef} className={`tf-column ${isOver ? 'over' : ''}`}><header><h2>{status} <span>{tasks.length}</span></h2><button aria-label={`Add task to ${status}`} onClick={() => add(status)}><Plus size={18} /></button></header><div className="tf-cards">{tasks.map(task => <TaskCard key={task.id} task={task} edit={edit} />)}{tasks.length === 0 && <p className="tf-empty">Drop a task here, or add a new one.</p>}</div></section>;
}
export default function KanbanBoard({ tasks, edit, add, move }: { tasks: Task[]; edit: (task: Task) => void; add: (status: TaskStatus) => void; move: (id: string, status: TaskStatus) => void }) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor));
  function onDragEnd({ active, over }: DragEndEvent) { if (over && statuses.includes(over.id as TaskStatus)) move(String(active.id), over.id as TaskStatus); }
  return <DndContext sensors={sensors} onDragEnd={onDragEnd}><div className="tf-board">{statuses.map(status => <KanbanColumn key={status} status={status} tasks={tasks.filter(t => t.status === status)} edit={edit} add={add} />)}</div></DndContext>;
}
