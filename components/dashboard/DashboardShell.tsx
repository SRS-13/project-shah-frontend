"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Layers3,
  LayoutDashboard,
  CheckSquare,
  Users,
  Search,
  Plus,
  Bell,
  HelpCircle,
  Inbox,
  CalendarDays,
  ArrowUpRight,
  Menu,
  X,
  Play,
  Pause,
  Send,
  Clock3,
  ChartNoAxesCombined,
} from "lucide-react";
import { useGetMeQuery } from "@/features/auth/authQuery";
import {
  members,
  sampleTasks,
  workspaces,
  type Task,
  type TaskStatus,
} from "@/features/tasks/dashboard-data";
import KanbanBoard, { Avatar, statuses } from "./KanbanBoard";
import "./dashboard.css";

export default function DashboardShell() {
  const { data: user, isLoading, isError } = useGetMeQuery();
  const [workspace, setWorkspace] = useState("TeamFlow");
  const [project, setProject] = useState("TeamFlow Platform");
  const [tasks, setTasks] = useState(sampleTasks);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("All");
  const [assignee, setAssignee] = useState("All");
  const [label, setLabel] = useState("All");
  const [view, setView] = useState("Dashboard");
  const [mobileNav, setMobileNav] = useState(false);
  const [editor, setEditor] = useState<Task | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);
  const projectTasks = tasks.filter((t) => t.project === project);
  const filtered = projectTasks.filter(
    (t) =>
      `${t.title} ${t.description} ${t.assignee}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (priority === "All" || t.priority === priority) &&
      (assignee === "All" || t.assignee === assignee) &&
      (label === "All" || t.label === label),
  );
  const completed = projectTasks.filter((t) => t.status === "Done").length;
  const percent = projectTasks.length
    ? Math.round((completed / projectTasks.length) * 100)
    : 0;
  function openEditor(task?: Task, status: TaskStatus = "To Do") {
    setEditor(
      task ?? {
        id: "",
        project,
        title: "",
        description: "",
        status,
        priority: "Medium",
        label: "Design",
        assignee: members[0],
        comments: 0,
        attachments: 0,
      },
    );
    dialog.current?.showModal();
  }
  function move(id: string, status: TaskStatus) {
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, status } : t)),
    );
  }
  return (
    <div className="tf-dashboard">
      <aside className={`tf-sidebar ${mobileNav ? "open" : ""}`}>
        <div className="tf-brand">
          <Link
            href="/dashboard"
            aria-label="TeamFlow dashboard"
            className="tf-logo-icon"
          >
            <Layers3 />
          </Link>
          TeamFlow
          <button
            className="tf-mobile-close"
            aria-label="Close navigation"
            onClick={() => setMobileNav(false)}
          >
            <X size={18} />
          </button>
        </div>
        <div className="tf-profile">
          <Avatar name={user?.name ?? "Demo User"} />
          <div>
            <strong>
              {isLoading
                ? "Loading profile…"
                : (user?.name ?? "Demo workspace")}
            </strong>
            <small>{user?.email ?? "Explore the TeamFlow preview"}</small>
          </div>
        </div>
        <nav className="tf-nav">
          <button
            className={view === "Dashboard" ? "active" : ""}
            onClick={() => {
              setView("Dashboard");
              setAssignee("All");
            }}
          >
            <LayoutDashboard size={18} />
            Project dashboard
          </button>
          <button
            className={view === "List" ? "active" : ""}
            onClick={() => {
              setView("List");
              setAssignee(members[0]);
            }}
          >
            <CheckSquare size={18} />
            My tasks{" "}
            <span>
              {projectTasks.filter((t) => t.assignee === members[0]).length}
            </span>
          </button>
          <div>
            <Inbox size={18} />
            Inbox <small>Coming soon</small>
          </div>
          <div>
            <Users size={18} />
            Team <span>{members.length}</span>
          </div>
          <button onClick={() => setView("Overview")}>
            <ChartNoAxesCombined size={18} />
            Reports
          </button>
        </nav>
        <div className="tf-workspace">
          <h3>WORKSPACE</h3>
          <select
            aria-label="Active workspace"
            value={workspace}
            onChange={(e) => {
              const w = workspaces.find((w) => w.name === e.target.value)!;
              setWorkspace(w.name);
              setProject(w.projects[0]);
            }}
          >
            {workspaces.map((w) => (
              <option key={w.name}>{w.name}</option>
            ))}
          </select>
          <h3>PROJECTS</h3>
          {workspaces
            .find((w) => w.name === workspace)!
            .projects.map((p, i) => (
              <button
                key={p}
                className={project === p ? "selected" : ""}
                onClick={() => {
                  setProject(p);
                  setMobileNav(false);
                }}
              >
                <i
                  style={{
                    background: ["#9861ed", "#f797bd", "#ffb56b", "#efcd5b"][i],
                  }}
                />
                {p}
              </button>
            ))}
        </div>
        <div className="tf-sidebar-bottom">
          <div className="tf-upgrade">
            <Layers3 size={22} />
            <strong>
              A little structure.
              <br />A lot more progress.
            </strong>
            <p>Your next great project starts here.</p>
            <button onClick={() => openEditor()}>
              Create a task <Plus size={15} />
            </button>
          </div>
          <p>TeamFlow · Sample workspace</p>
        </div>
      </aside>
      <div className="tf-main">
        <header className="tf-topbar">
          <button
            className="tf-menu"
            aria-label="Open navigation"
            onClick={() => setMobileNav(true)}
          >
            <Menu />
          </button>
          <div className="tf-breadcrumb">
            Workspace <span>/</span> <strong>Projects</strong>
          </div>
          <label className="tf-search">
            <Search size={17} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks or people…"
              aria-label="Search tasks"
            />
          </label>
          <div className="tf-top-actions">
            <div className="tf-avatar-stack">
              {members.slice(0, 3).map((name) => (
                <Avatar key={name} name={name} />
              ))}
            </div>
            <span className="tf-top-icon" title="Notifications coming soon">
              <Bell size={20} />
            </span>
            <Link href="/login" aria-label="Sign in">
              <HelpCircle size={20} />
            </Link>
          </div>
        </header>
        <main className="tf-content">
          <div className="tf-heading">
            <div>
              <p>YOUR WORKSPACE, SIMPLIFIED</p>
              <h1>Project dashboard</h1>
            </div>
            <span className="tf-demo">
              Sample data · changes reset on reload
            </span>
          </div>
          {isError && (
            <p className="tf-auth-note">
              Profile unavailable. You’re viewing the sample workspace.{" "}
              <Link href="/login">Sign in</Link>
            </p>
          )}
          <div className="tf-layout">
            <div className="tf-project-area">
              <section className="tf-hero">
                <div className="tf-hero-icon">
                  <Layers3 size={32} />
                </div>
                <div className="tf-hero-copy">
                  <p>LET’S MAKE IT HAPPEN</p>
                  <h2>{project}</h2>
                  <p>Build something great. One task at a time.</p>
                  <div className="tf-hero-meta">
                    <span className="tf-active">● Active</span>
                    <span>
                      <Layers3 size={13} /> Product
                    </span>
                    <span>
                      <CalendarDays size={14} /> Sample project
                    </span>
                  </div>
                </div>
                <div className="tf-avatar-stack">
                  {members.slice(0, 3).map((n) => (
                    <Avatar name={n} key={n} />
                  ))}
                  <span className="tf-avatar">+1</span>
                </div>
              </section>
              <nav className="tf-tabs" aria-label="Project views">
                {["Overview", "List", "Dashboard"].map((tab) => (
                  <button
                    key={tab}
                    className={view === tab ? "active" : ""}
                    onClick={() => setView(tab)}
                  >
                    {tab}
                  </button>
                ))}
                <span title="Available when the scheduling backend is connected">
                  Timeline <small>Soon</small>
                </span>
                <span title="Available when the scheduling backend is connected">
                  Calendar <small>Soon</small>
                </span>
              </nav>
              <div className="tf-toolbar">
                <div className="tf-filters">
                  <label>
                    Assignee{" "}
                    <select
                      aria-label="Filter by assignee"
                      value={assignee}
                      onChange={(e) => setAssignee(e.target.value)}
                    >
                      {["All", ...members].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Priority{" "}
                    <select
                      aria-label="Filter by priority"
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      {["All", "High", "Medium", "Low"].map((n) => (
                        <option key={n}>{n}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Label{" "}
                    <select
                      aria-label="Filter by label"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                    >
                      {["All", "Design", "Frontend", "Backend", "Setup"].map(
                        (n) => (
                          <option key={n}>{n}</option>
                        ),
                      )}
                    </select>
                  </label>
                </div>
                <button className="tf-primary" onClick={() => openEditor()}>
                  <Plus size={16} />
                  Add task
                </button>
              </div>
              {view === "Dashboard" && (
                <KanbanBoard
                  tasks={filtered}
                  edit={openEditor}
                  add={(status) => openEditor(undefined, status)}
                  move={move}
                />
              )}
              {view === "List" && (
                <div className="tf-list">
                  {filtered.length === 0 && (
                    <p className="tf-empty">No tasks match your filters.</p>
                  )}
                  {filtered.map((t) => (
                    <div key={t.id}>
                      <button onClick={() => openEditor(t)}>
                        <strong>{t.title}</strong>
                        <small>
                          {t.assignee} · {t.priority} priority
                        </small>
                      </button>
                      <select
                        aria-label={`Status of ${t.title}`}
                        value={t.status}
                        onChange={(e) =>
                          move(t.id, e.target.value as TaskStatus)
                        }
                      >
                        {statuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              {view === "Overview" && (
                <section className="tf-panel tf-overview">
                  <h2>A shared view of what’s next.</h2>
                  <p>
                    {projectTasks.length} tasks across your project. {completed}{" "}
                    complete, with{" "}
                    {
                      projectTasks.filter((t) => t.status === "In Progress")
                        .length
                    }{" "}
                    currently in progress.
                  </p>
                  <div className="tf-overview-stats">
                    {statuses.map((s) => (
                      <div key={s}>
                        <strong>
                          {projectTasks.filter((t) => t.status === s).length}
                        </strong>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                  <p>
                    Project data is illustrative. Workspace and task APIs are
                    not connected yet.
                  </p>
                </section>
              )}
              <p className="tf-board-hint">
                Drag a card using its handle to change status, or open it to
                edit.
              </p>
            </div>
            <aside className="tf-insights">
              <section className="tf-panel">
                <header>
                  <h2>Project progress</h2>
                  <ArrowUpRight size={17} />
                </header>
                <div className="tf-progress">
                  <div
                    className="tf-donut"
                    style={{
                      background: `conic-gradient(#9758f2 ${percent}%, #ede3ff 0)`,
                    }}
                  >
                    <span>
                      {percent}%<small>complete</small>
                    </span>
                  </div>
                  <div className="tf-legend">
                    {["Done", "In Progress", "To Do"].map((s, i) => (
                      <div key={s}>
                        <i
                          style={{
                            background: ["#9758f2", "#c6a6fa", "#e5d8fc"][i],
                          }}
                        />
                        <span>{s}</span>
                        <strong>
                          {projectTasks.filter((t) => t.status === s).length}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <section className="tf-panel">
                <header>
                  <h2>Time tracking</h2>
                  <Clock3 size={17} />
                </header>
                <p className="tf-time">
                  {Math.floor(seconds / 3600)}
                  <small>h</small> {Math.floor(seconds / 60) % 60}
                  <small>m</small> {seconds % 60}
                  <small>s</small>
                </p>
                <button
                  className="tf-timer"
                  onClick={() => setRunning(!running)}
                >
                  {running ? <Pause size={15} /> : <Play size={15} />}
                  {running ? "Pause timer" : "Start timer"}
                </button>
                <div
                  className="tf-chart"
                  aria-label="Illustrative weekly activity chart"
                >
                  <svg viewBox="0 0 300 90" role="img">
                    <title>Sample weekly activity</title>
                    <path
                      d="M0 65 Q25 20 50 50 T100 40 T150 65 T200 40 T250 35 T300 20"
                      fill="none"
                      stroke="#a16af4"
                      strokeWidth="3"
                    />
                    <path
                      d="M0 65 Q25 20 50 50 T100 40 T150 65 T200 40 T250 35 T300 20 V90 H0Z"
                      fill="#a16af4"
                      opacity=".12"
                    />
                  </svg>
                  <div>
                    {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                      <span key={i}>{d}</span>
                    ))}
                  </div>
                </div>
                <small className="tf-muted">
                  Timer is local to this visit · chart is sample data
                </small>
              </section>
              <section className="tf-panel tf-chat">
                <header>
                  <h2>Team chat</h2>
                  <span className="tf-offline">Preview</span>
                </header>
                <div className="tf-chat-message">
                  <Avatar name="Michael Reed" />
                  <div>
                    <strong>
                      Michael Reed <small>10:24 AM</small>
                    </strong>
                    <p>
                      The foundation is ready. Let’s bring this project to life!
                    </p>
                  </div>
                </div>
                <div className="tf-chat-message">
                  <Avatar name="Sophia Nguyen" />
                  <div>
                    <strong>
                      Sophia Nguyen <small>10:32 AM</small>
                    </strong>
                    <p>Love it! The designs are ready for review.</p>
                  </div>
                </div>
                <p className="tf-muted">
                  Live chat will be available when the messaging backend is
                  connected.
                </p>
                <div className="tf-chat-input">
                  <input
                    disabled
                    placeholder="Messaging coming soon"
                    aria-label="Chat unavailable"
                  />
                  <Send size={18} />
                </div>
              </section>
            </aside>
          </div>
        </main>
      </div>
      <dialog
        ref={dialog}
        className="tf-dialog"
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!editor?.title.trim()) return;
            const saved = {
              ...editor,
              title: editor.title.trim(),
              id: editor.id || crypto.randomUUID(),
            };
            setTasks((current) =>
              editor.id
                ? current.map((t) => (t.id === saved.id ? saved : t))
                : [...current, saved],
            );
            dialog.current?.close();
          }}
        >
          <header>
            <h2>{editor?.id ? "Edit task" : "Create a task"}</h2>
            <button
              type="button"
              aria-label="Close task editor"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} />
            </button>
          </header>
          {editor && (
            <>
              <label>
                Task name
                <input
                  autoFocus
                  required
                  maxLength={120}
                  value={editor.title}
                  onChange={(e) =>
                    setEditor({ ...editor, title: e.target.value })
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  rows={3}
                  value={editor.description}
                  onChange={(e) =>
                    setEditor({ ...editor, description: e.target.value })
                  }
                />
              </label>
              <div className="tf-editor-grid">
                <label>
                  Status
                  <select
                    value={editor.status}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        status: e.target.value as TaskStatus,
                      })
                    }
                  >
                    {statuses.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Priority
                  <select
                    value={editor.priority}
                    onChange={(e) =>
                      setEditor({
                        ...editor,
                        priority: e.target.value as Task["priority"],
                      })
                    }
                  >
                    {["Low", "Medium", "High"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Assignee
                  <select
                    value={editor.assignee}
                    onChange={(e) =>
                      setEditor({ ...editor, assignee: e.target.value })
                    }
                  >
                    {members.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Label
                  <select
                    value={editor.label}
                    onChange={(e) =>
                      setEditor({ ...editor, label: e.target.value })
                    }
                  >
                    {["Design", "Frontend", "Backend", "Setup"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <p className="tf-muted">
                Sample workspace. This change lasts until you reload.
              </p>
              <button className="tf-primary" type="submit">
                {editor.id ? "Save changes" : "Create task"}
              </button>
            </>
          )}
        </form>
      </dialog>
    </div>
  );
}
