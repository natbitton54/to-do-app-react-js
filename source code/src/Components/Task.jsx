import { collection, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function TaskList({
  tasks,
  filter,
  setFilter,
  onToggle,
  onDelete,
  onEdit,
  onAdd,
}) {
  const filtered = tasks.filter((task) =>
    filter === "done" ? task.done : filter === "notDone" ? !task.done : true
  );
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showConfirmDeleteForm, setShowConfirmDeleteForm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    date: "",
    time: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(
        collection(db, "users", user.uid, "categories")
      );
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(list);
    };
    if (user) fetchCategories();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const dueDate = `${formData.date} ${formData.time}`;
    const task = { ...formData, due: dueDate };

    if (editMode) {
      onEdit(currentId, task);
    } else {
      onAdd(task);
    }

    setFormData({
      title: "",
      description: "",
      category: "",
      date: "",
      time: "",
    });
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

  return (
    <div className="mt-10">
      <h1 className="text-4xl font-semibold text-gray-500 dark:text-gray-300 mb-4 text-center">
        All your tasks
      </h1>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-3xl font-semibold text-gray-700 dark:text-gray-200">
          Tasks
        </h3>
        <div className="flex gap-2">
          {["all", "done", "notDone"].map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1 text-sm font-medium rounded-full border transition ${
                filter === key
                  ? "border-black border-2 bg-opacity-90 dark:border-white"
                  : "hover:bg-opacity-80"
              } ${
                key === "done"
                  ? filter === key
                    ? "bg-green-500 text-white"
                    : "bg-green-400 text-white border-green-500"
                  : key === "notDone"
                  ? filter === key
                    ? "bg-red-600 text-white"
                    : "bg-red-500 text-white border-red-500"
                  : filter === key
                  ? "bg-gray-300 text-black dark:text-white"
                  : "bg-gray-100 text-black dark:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
              }`}
            >
              {key === "all" ? "All" : key === "done" ? "Done" : "Not done"}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 shadow rounded p-4 pb-1 transition-colors duration-300">
        {filtered.length ? (
          filtered.map((task) => {
            const categoryInfo = categories.find(
              (c) => c.name === task.category
            );
            return (
              <div
                key={task.id}
                className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3 shadow-sm mb-5"
              >
                <div className="flex items-center gap-4 min-h-[3.5rem]">
                  <button
                    className={`w-7 h-7 rounded-full border-2 border-black dark:border-white flex items-center justify-center transition-colors duration-200 ${
                      task.done ? "bg-black dark:bg-white" : "bg-transparent"
                    }`}
                    onClick={() => onToggle(task.id, !task.done)}
                  >
                    {task.done && (
                      <span className="w-3 h-3 bg-white dark:bg-black rounded-full" />
                    )}
                  </button>
                  <div className="w-px bg-gray-300 dark:bg-gray-600 h-full" />
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
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoryInfo?.color }}
                      ></span>
                      <div className={`${task.done ? "line-through" : ""}`}>
                        {task.category}
                      </div>
                      <span className="mx-2 text-gray-400">|</span>
                      <div className={`${task.done ? "line-through" : ""}`}>
                        Due: {task.due}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
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

      <button
        onClick={() => {
          setShowForm(true);
          setEditMode(false);
          setFormData({
            title: "",
            description: "",
            category: "",
            date: "",
            time: "",
          });
        }}
        className="w-full text-xl flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-300 rounded-2xl py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 mt-5"
      >
        <FaPlus />
        <span className="text-xl font-medium">Add a task</span>
      </button>

      {showConfirmDeleteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-full max-w-sm text-center">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 text-white">
              {editMode ? "Edit Task" : "New Task"}
            </h2>
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
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded"
              required
            />
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded appearance-none"
              required
            />
            <input
              type="time"
              value={formData.time}
              onChange={(e) =>
                setFormData({ ...formData, time: e.target.value })
              }
              className="w-full mb-3 p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded appearance-none"
              required
            />
            <div className="flex justify-between">
              <button
                type="submit"
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                {editMode ? "Save Changes" : "Add Task"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
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
