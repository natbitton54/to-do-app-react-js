import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { showError } from "../utils/alerts";
import Sidenav from "./Sidenav";
import { useNavigate } from "react-router-dom";

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#6b7280");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTaskByCategory = onSnapshot(
      collection(db, "users", user.uid, "categories"),
      async (snapshot) => {
        const categoryDocs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const category = categoryDocs.find((doc) => doc.link === categorySlug);

        if (!category) {
          showError("Category not found or was deleted.");
          navigate("/dashboard");
          return;
        }

        setCategoryName(category.name);
        setCategoryColor(category.color);

        try {
          const taskQuery = query(
            collection(db, "users", user.uid, "tasks"),
            where("category", "==", category.name)
          );
          const taskSnapshot = await getDocs(taskQuery);
          const taskList = taskSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setTasks(taskList);
        } catch (err) {
          showError("Failed to load tasks: " + (err.message || err));
        }

        setLoading(false);
      }
    );

    return () => fetchTaskByCategory();
  }, [user, categorySlug, navigate]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="flex">
        <Sidenav />
        <div className="p-6 flex-1">
          <h1 className="text-3xl font-bold mb-8">
            Tasks for{" "}
            <span style={{ color: categoryColor }}>
              "{categoryName || decodeURIComponent(categorySlug)}"
            </span>
          </h1>

          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
          ) : tasks.length > 0 ? (
            <ul className="space-y-6">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md p-6 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h2>
                    </div>
                    <div className="flex flex-col text-right">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {task.due
                          ? new Date(task.due).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "No due date"}
                      </span>
                      <span
                        className={`block mt-2 font-medium text-sm px-2 py-1 rounded-full w-fit ml-auto ${
                          task.done
                            ? "bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-100"
                        }`}
                      >
                        Status: {task.done ? "Done" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <p className="text-base text-gray-800 dark:text-gray-200">
                    {task.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg flex justify-center mt-20 text-gray-700 dark:text-gray-300">
              No tasks added to {categoryName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
