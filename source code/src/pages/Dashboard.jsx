import React, { useEffect, useReducer, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidenav from "./Sidenav";
import "../styles/dashboard.css";
import { FaPencilAlt, FaPlus, FaTrash } from "react-icons/fa";
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

const taskReducer = (state, action) => {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "TOGGLE":
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, done: action.payload.done }
          : task
      );
    case "DELETE":
      return state.filter((task) => task.id !== action.payload.id);
    case "EDIT":
      return state.map((task) =>
        task.id === action.payload.id
          ? { ...task, ...action.payload.data }
          : task
      );
    default:
      return state;
  }
};

export default function Dashboard() {
  const { user } = useAuth();
  const [time, setTime] = useState(new Date());
  const [filter, setFilter] = useState("all");
  const [tasks, dispatch] = useReducer(taskReducer, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "tasks"),
      (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        dispatch({ type: "LOAD", payload: list });
      }
    );

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = time.getHours();
    if (hour >= 5 && hour < 12) return "Good Morning";
    if (hour >= 12 && hour < 17) return "Good Afternoon";
    if (hour >= 17 && hour < 21) return "Good Evening";
    return "Good Night";
  };

  const getDateString = () => {
    return time.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTimeString = () => {
    return time.toLocaleString("en-US", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    });
  };

  const handleToggle = async (id, done) => {
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    await updateDoc(taskRef, { done });
    dispatch({ type: "TOGGLE", payload: { id, done } });
  };

  const handleAddTasks = async (newTask) => {
    const taskRef = collection(db, "users", user.uid, "tasks");

    await addDoc(taskRef, {
      ...newTask,
      done: false,
    });
  };

  const handleDelete = async (id) => {
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    await deleteDoc(taskRef);
    dispatch({ type: "DELETE", payload: { id } });
  };

  const handleEdit = async (id, data) => {
    const taskRef = doc(db, "users", user.uid, "tasks", id);
    await updateDoc(taskRef, data);
    dispatch({ type: "EDIT", payload: { id, data } });
  };

  return (
    <div className="flex bg-white dark:bg-gray-900 min-h-screen">
      <Sidenav />
      <div className="container p-6 text-gray-800 dark:text-gray-100">
        <p className="greetings text-xl font-semibold text-purple-700 dark:text-purple-400">
          {getGreeting()},{" "}
          <span className="text-[#828afa]">{user?.displayName || "User"}!</span>
        </p>
        <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
          It’s {getDateString()} {getTimeString()}
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
      </div>
    </div>
  );
}
