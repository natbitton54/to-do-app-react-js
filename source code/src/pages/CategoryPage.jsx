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
      <div className="flex flex-col md:flex-row">
        <Sidenav />
        <main className="p-6 flex-1 mt-14 w-full overflow-x-hidden">
          <h1 className="text-3xl font-bold mb-4">
            Tasks for{" "}
            <span style={{ color: categoryColor }}>
              "{categoryName || decodeURIComponent(categorySlug)}"
            </span>
          </h1>

          {/* Mobile-only deleted warning (if category not found) */}
          {categoryName === "" && (
            <div className="md:hidden mb-6 p-3 rounded bg-yellow-100 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 text-center">
              This category may have been deleted. Open the <b>☰</b> menu to
              select another.
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading tasks...</p>
          ) : tasks.length > 0 ? (
            <ul className="space-y-6">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-md p-6 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {task.title}
                      </h2>
                    </div>
                    <div className="text-sm text-right text-gray-600 dark:text-gray-400">
                      <div>
                        {task.due
                          ? new Date(task.due).toLocaleString("en-US", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "No due date"}
                      </div>
                      <span
                        className={`mt-1 inline-block font-medium px-2 py-1 rounded-full ${
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
        </main>
      </div>
    </div>
  );
}
