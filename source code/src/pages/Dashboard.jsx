// Dashboard.jsx
import React, { useEffect, useReducer, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidenav from "./Sidenav";
import "../styles/dashboard.css";
import TaskList from "../Components/Task";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
} from "firebase/firestore";

// ---------- reducer ----------
const taskReducer = (state, action) => {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "TOGGLE":
      return state.map((t) =>
        t.id === action.payload.id ? { ...t, done: action.payload.done } : t
      );
    case "DELETE":
      return state.filter((t) => t.id !== action.payload.id);
    case "EDIT":
      return state.map((t) =>
        t.id === action.payload.id ? { ...t, ...action.payload.data } : t
      );
    default:
      return state;
  }
};

// ---------- helpers ----------
/** Turn yyyy-MM-dd + HH:mm -> yyyy-MM-dd HH:mm:ss */
const buildDueString = (date, time) =>
  `${date} ${time.trim().length === 5 ? `${time}:00` : time}`; // pad seconds

export default function Dashboard() {
  const { user, tz = "UTC" } = useAuth();
  const [time, setTime] = useState(new Date());
  const [filter, setFilter] = useState("all");
  const [tasks, dispatch] = useReducer(taskReducer, []);

  // live tasks listener
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(
      collection(db, "users", user.uid, "tasks"),
      (snap) =>
        dispatch({
          type: "LOAD",
          payload: snap.docs.map((d) => ({ id: d.id, ...d.data() })),
        })
    );
    return unsub;
  }, [user]);

  // ticking clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ---- greeting / clock strings ----
  const buildDueString = (date, time) =>
    `${date} ${time.trim().length === 5 ? `${time}:00` : time}`;

  const getGreeting = (time, tz) => {
    const hour = Number(
      time.toLocaleTimeString("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: tz,
      })
    );
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const getDateString = (time, tz) =>
    time.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: tz,
    });

  const getTimeString = (time, tz) =>
    time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
      timeZone: tz,
    });

  // ---- CRUD handlers ----
  const handleToggle = async (id, done) => {
    const ref = doc(db, "users", user.uid, "tasks", id);
    await updateDoc(ref, { done });
    dispatch({ type: "TOGGLE", payload: { id, done } });
  };

  const handleAddTasks = async (newTask) => {
    const ref = collection(db, "users", user.uid, "tasks");
    await addDoc(ref, {
      ...newTask,
      due: buildDueString(newTask.date, newTask.time),
      done: false,
      reminderSent: false,
    });
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "users", user.uid, "tasks", id));
    dispatch({ type: "DELETE", payload: { id } });
  };

  const handleEdit = async (id, data) => {
    const ref = doc(db, "users", user.uid, "tasks", id);
    const patch = {
      ...data,
      due: buildDueString(data.date, data.time),
      reminderSent: false,
    };
    await updateDoc(ref, patch);
    dispatch({ type: "EDIT", payload: { id, data: patch } });
  };

  // ---- UI ----
  return (
    <div className="flex flex-col md:flex-row bg-white dark:bg-gray-900 min-h-screen">
      <Sidenav />

      <main className="flex-1 w-full mt-14 p-4 sm:p-6 overflow-x-hidden">
        <p className="greetings text-xl font-semibold text-purple-700 dark:text-purple-400">
          {getGreeting(time, tz)},{" "}
          <span className="text-[#828afa]">{user?.displayName || "User"}!</span>
        </p>

        <p className="text-gray-700 dark:text-gray-300 text-lg font-medium mb-4">
          It’s {getDateString(time, tz)} {getTimeString(time, tz)}
        </p>

        <TaskList
          tasks={tasks}
          filter={filter}
          setFilter={setFilter}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onAdd={handleAddTasks}
          onEdit={handleEdit}
        />
      </main>
    </div>
  );
}
