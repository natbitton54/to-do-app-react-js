import React, { useEffect, useRef, useState } from "react";
import {
  FaCalendarAlt,
  FaClock,
  FaPencilAlt,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { scheduleTaskReminder } from "../utils/reminders";
import { showError } from "../utils/alerts";

export default function TaskList({
  tasks,
  filter,
  setFilter,
  onToggle,
  onDelete,
  onEdit,
  onAdd,
}) {
  const { user } = useAuth();

  // ────────── State ──────────
  const [categories, setCategories] = useState([]); // actual data
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showConfirmDeleteForm, setShowConfirmDeleteForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [categoryReady, setCategoryReady] = useState(false); // loading flag

  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
  });

  // ────────── Live categories listener ──────────
  useEffect(() => {
    if (!user) {
      setCategories([]); // clear when logged out
      setCategoryReady(true); // nothing to load
      return;
    }
    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "categories"),
      (snap) => {
        setCategories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setCategoryReady(true); // first snapshot received
      }
    );
    return unsubscribe;
  }, [user]);

  // Clear form category if it no longer exists
  useEffect(() => {
    if (
      formData.category &&
      !categories.some((c) => c.name === formData.category)
    ) {
      setFormData((prev) => ({ ...prev, category: "" }));
    }
  }, [categories, formData.category]);

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          console.log("Notification permission:", permission);
        });
      } else {
        console.log("Notification already", Notification.permission);
      }
    }
  }, []);

  // ────────── Helpers ──────────
  const filtered = tasks.filter((t) =>
    filter === "done" ? t.done : filter === "notDone" ? !t.done : true
  );

  const resetForm = () =>
    setFormData({
      title: "",
      description: "",
      category: "",
      date: "",
      time: "",
    });

  const calcRemindAtMs = (dueMs) => {
    const now = Date.now();
    const twoThirds = now + (dueMs - now) * (2 / 3);
    const fiveMinutesLead = dueMs - 5 * 60 * 1000;
    return Math.min(twoThirds, fiveMinutesLead);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dueISO = `${formData.date}T${formData.time}`;
    const dueMs = new Date(dueISO).getTime();
    const remindAtMs = calcRemindAtMs(dueMs);
    const dueStore = dueISO.replace("T", " ") + ":00";

    const taskPayload = {
      ...formData,
      due: dueStore,
      remindAt: remindAtMs,
      createdMs: Date.now(),
      reminderSent: false,
    };

    editMode ? onEdit(currentId, taskPayload) : onAdd(taskPayload);

    if (
      user?.uid &&
      dueMs > Date.now() &&
      Notification.permission === "granted"
    ) {
      scheduleTaskReminder({ uid: user.uid, title: formData.title, dueMs });
    }

    resetForm();
    setShowForm(false);
    setEditMode(false);
    setCurrentId(null);
  };

  const startEdit = (task) => {
    const [date, time] = task.due?.split(" ") || ["", ""];
    setFormData({
      title: task.title,
      description: task.description,
      category: task.category,
      date,
      time,
    });
    setCurrentId(task.id);
    setEditMode(true);
    setShowForm(true);
  };

  // ────────── **Fixed** pretty-printer ──────────
  const formatDue = (dueStr) => {
    if (!dueStr) return "";

    const [d, t] = dueStr.split(" ");
    const [y, m, day] = d.split("-");
    const [h, min, s] = t.split(":");

    const date = new Date(
      Number(y),
      Number(m) - 1, // months 0-based
      Number(day),
      Number(h),
      Number(min),
      Number(s || 0)
    );

    return date.toLocaleString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // ────────── JSX ──────────
  return (
    <div className="mt-10">
      {/* Heading */}
      <h1 className="text-4xl font-semibold text-gray-500 dark:text-gray-300 mb-4 text-center">
        All your tasks
      </h1>

      {/* Filter buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h3 className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
          Tasks
        </h3>
        <div className="flex gap-2 flex-wrap">
          {["all", "done", "notDone"].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 text-sm font-medium rounded-full border transition
                ${filter === key ? "border-2" : ""}
                ${
                  key === "done"
                    ? filter === key
                      ? "border-green-600 bg-green-600 text-white"
                      : "border-green-500 bg-green-500 text-white"
                    : key === "notDone"
                    ? filter === key
                      ? "border-red-600 bg-red-600 text-white"
                      : "border-red-500 bg-red-500 text-white"
                    : filter === key
                    ? "border-gray-700 bg-gray-300 dark:bg-gray-500 text-black dark:text-white"
                    : "border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                }`}
            >
              {key === "all" ? "All" : key === "done" ? "Done" : "Not done"}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile-only no-category alert */}
      {categoryReady && categories.length === 0 && (
        <div className="mb-6 p-3 rounded bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 text-center">
          {window.innerWidth <= 768 ? (
            <>
              You don’t have any categories yet. Tap the <b>☰</b> menu to open
              the sidebar and create one, or leave tasks as <b>Uncategorized</b>
              .
            </>
          ) : (
            <>
              You don’t have any categories yet. View the sidebar and create
              one, or leave tasks as <b>Uncategorized</b>.
            </>
          )}
        </div>
      )}

      {/* Task list */}
      <div className="bg-white dark:bg-gray-900 shadow rounded p-4 pb-1 transition-colors">
        {filtered.length ? (
          filtered.map((task) => {
            const categoryInfo = categories.find(
              (c) => c.name === task.category
            );
            const dueDate = new Date(task.due);
            const isOverdue = !task.done && dueDate < new Date();

            const status = task.done
              ? "Done"
              : isOverdue
              ? "Overdue"
              : "Pending";

            const statusClass = {
              Done: "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100",
              Overdue:
                "bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100",
              Pending:
                "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100",
            };

            return (
              <div
                key={task.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm mb-5"
              >
                {/* Left side */}
                <div className="flex items-start sm:items-center gap-4">
                  {/* Checkbox */}
                  <button
                    className={`flex-shrink-0 w-7 h-7 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-colors ${
                      task.done ? "bg-black dark:bg-white" : "bg-transparent"
                    }`}
                    onClick={() => onToggle(task.id, !task.done)}
                  >
                    {task.done && (
                      <span className="w-3 h-3 bg-white dark:bg-black rounded-full" />
                    )}
                  </button>

                  {/* Info */}
                  <div>
                    <p
                      className={`font-medium text-gray-800 dark:text-gray-100 text-lg ${
                        task.done
                          ? "line-through decoration-2 decoration-gray-500"
                          : ""
                      }`}
                    >
                      {task.title}
                    </p>

                    <p
                      className={`text-gray-600 dark:text-gray-400 text-sm mb-1 ${
                        task.done
                          ? "line-through decoration-2 decoration-gray-500"
                          : ""
                      }`}
                    >
                      {task.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      {/* Category dot */}
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: categoryInfo
                            ? categoryInfo.color
                            : "#6b7280",
                        }}
                      />
                      {/* Category name (fallback) */}
                      <span className={task.done ? "line-through" : ""}>
                        {categoryInfo ? categoryInfo.name : "Uncategorized"}
                      </span>
                      <span className="hidden sm:inline mx-2 text-gray-400">
                        |
                      </span>
                      <span className={task.done ? "line-through" : ""}>
                        Due: {formatDue(task.due)}
                      </span>
                    </div>

                    {/* Status Text */}
                    <span
                      className={`mt-2 inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusClass[status]}`}
                    >
                      {status}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => startEdit(task)}
                    className="text-gray-400 dark:text-gray-300 text-xl hover:text-black dark:hover:text-white p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <FaPencilAlt />
                  </button>
                  <button
                    onClick={() => {
                      setPendingDeleteId(task.id);
                      setShowConfirmDeleteForm(true);
                    }}
                    className="text-red-400 text-xl hover:text-red-500 p-2 rounded hover:bg-red-50 dark:hover:bg-red-900 transition"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-center py-6">
            No tasks found.
          </p>
        )}
      </div>

      {/* Add task button */}
      <button
        onClick={() => {
          setShowForm(true);
          setEditMode(false);
          resetForm();
        }}
        className="w-full text-xl flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-300 rounded-2xl py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-5"
      >
        <FaPlus />
        <span className="text-xl font-medium">Add a task</span>
      </button>

      {/* Confirm Delete dialog */}
      {showConfirmDeleteForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4 dark:text-red-600">
              Confirm Delete
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  onDelete(pendingDeleteId);
                  setShowConfirmDeleteForm(false);
                  setPendingDeleteId(null);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, delete
              </button>
              <button
                onClick={() => {
                  setShowConfirmDeleteForm(false);
                  setPendingDeleteId(null);
                }}
                className="text-gray-500 dark:text-gray-300 px-4 py-2 hover:underline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {editMode ? "Edit Task" : "New Task"}
            </h2>

            {/* Title */}
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded"
              required
            />

            {/* Description */}
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded"
            />

            {/* Category select */}
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              disabled={categories.length === 0}
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded disabled:opacity-60"
            >
              {categories.length === 0 ? (
                <option value="">
                  No categories – will use “Uncategorized”
                </option>
              ) : (
                <>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </>
              )}
            </select>

            {/* Date */}
            <div className="relative mb-3">
              <input
                ref={dateInputRef}
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded"
                required
              />
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker()}
                className="absolute left-3 top-3 text-gray-400 dark:text-gray-300"
              >
                <FaCalendarAlt />
              </button>
            </div>

            {/* Time */}
            <div className="relative mb-3">
              <input
                ref={timeInputRef}
                type="time"
                value={formData.time}
                onChange={(e) =>
                  setFormData({ ...formData, time: e.target.value })
                }
                className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded"
                required
              />
              <button
                type="button"
                onClick={() => timeInputRef.current?.showPicker()}
                className="absolute left-3 top-3 text-gray-400 dark:text-gray-300"
              >
                <FaClock />
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                {editMode ? "Save Changes" : "Add Task"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-500 dark:text-gray-300 px-4 py-2 hover:underline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
