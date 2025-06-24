import React, { useEffect, useReducer, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaClipboardCheck, FaFolder } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import "../styles/sidenav.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import FormCategory from "../Components/FormCategory";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { showError, showSuccess } from "../utils/alerts";
import ConfirmDelete from "../Components/ConfirmDelete";
import useDarkMode from "../hooks/useDarkMode";

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
}

function categoryReducer(state, action) {
  switch (action.type) {
    case "LOAD":
      return action.payload;
    case "DELETE":
      return state.filter((category) => category.id !== action.payload.id);
    case "EDIT":
      return state.map((category) =>
        category.id === action.payload.id
          ? {
              ...category,
              name: action.payload.name,
              color: action.payload.color,
              link: slugify(action.payload.name),
            }
          : category
      );
    default:
      return state;
  }
}

export default function Sidenav() {
  const { user } = useAuth();
  const [showCategories, setShowCategories] = useState(true);
  const [categories, dispatch] = useReducer(categoryReducer, []);
  const [displayName, setDisplayName] = useState("User");
  const [showForm, setShowForm] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editInitialValue, setEditInitialValue] = useState("");
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [darkMode, setDarkMode] = useDarkMode();
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    if (user?.displayName) {
      setDisplayName(user.displayName);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "categories"),
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

  const toggleCategories = () => setShowCategories(!showCategories);

  const handleNameExist = async (name) => {
    const categoriesRef = collection(db, "users", user.uid, "categories");

    const snapshot = await getDocs(categoriesRef);
    const exists = snapshot.docs.some(
      (doc) => doc.data().name.toLowerCase() === name.trim().toLowerCase()
    );

    if (exists) {
      showError("A category with that name already exists.");
    }

    return exists;
  };

  const handleDeleteCategory = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "categories", id));
      dispatch({ type: "DELETE", payload: { id } });
      showSuccess("Category deleted successfully!");
    } catch (err) {
      showError("Error deleting category: " + (err.message || err));
    }
  };

  const handleEditCategory = async (id, newName, newColor) => {
    try {
      const nameExists = await handleNameExist(newName);
      if (nameExists) return;

      const categoryRef = doc(db, "users", user.uid, "categories", id);
      await updateDoc(categoryRef, {
        name: newName,
        color: newColor,
        link: slugify(newName),
      });

      dispatch({
        type: "EDIT",
        payload: {
          id,
          name: newName,
          color: newColor,
        },
      });
      showSuccess("Category updated successfully!");
    } catch (err) {
      showError("Error editing category: " + (err.message || err));
    }
  };

  const handleAddCategories = async (name, color) => {
    try {
      const categoriesRef = collection(db, "users", user.uid, "categories");
      const nameExists = await handleNameExist(name);
      if (nameExists) return;

      await addDoc(categoriesRef, {
        name: name.trim(),
        color,
        link: slugify(name),
      });

      setShowForm(false);
    } catch (err) {
      showError("Error adding category: " + (err.message || err));
    }
  };

  return (
    <aside
      className="w-64 h-screen flex flex-col justify-between shadow-lg transition-colors
      bg-gray-100 dark:bg-[#111827] text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-700"
    >
      {/* Top content */}
      <div className="img-container flex flex-col items-center py-6">
        <Link to="/">
          <img
            src={`${process.env.PUBLIC_URL}/images/todo-app-logo.png`}
            alt="App logo"
            className="w-28 h-28 object-contain"
          />
        </Link>
        <p className="username mt-2">{displayName}</p>

        {/* Tasks */}
        <Link to="/dashboard" className="w-full mt-6">
          <div
            className={`w-full flex items-center gap-2 px-6 py-2 font-semibold rounded transition 
              ${
                currentPath === "/dashboard"
                  ? "bg-purple-600 text-white"
                  : "text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800"
              }`}
          >
            <FaClipboardCheck />
            <span>Tasks</span>
          </div>
        </Link>

        {/* Toggle Theme */}
        <div className="w-full mt-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center gap-2 px-5 py-2 font-semibold rounded 
              text-black-600 dark:text-white hover:bg-purple-100 dark:hover:bg-purple-800 transition"
          >
            {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {/* Account */}
        <Link to="/dashboard/account" className="w-full mt-2">
          <div
            className={`w-full flex items-center gap-2 px-6 py-2 font-semibold rounded transition 
              ${
                currentPath === "/dashboard/account"
                  ? "bg-purple-600 text-white"
                  : "text-blue-400 dark:text-blue-300 hover:bg-purple-100 dark:hover:bg-purple-800"
              }`}
          >
            <FontAwesomeIcon icon={faUser} />
            <span>Account</span>
          </div>
        </Link>

        {/* Categories */}
        <div className="w-full px-6 mt-4">
          <button
            onClick={toggleCategories}
            className="flex items-center justify-between w-full font-semibold mb-2 py-2 
              text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-800"
          >
            <div className="flex items-center gap-2">
              <FaFolder />
              Categories
            </div>
            <span>{showCategories ? "▲" : "▼"}</span>
          </button>

          {showCategories && (
            <ul className="space-y-2 text-sm pl-6 text-gray-700 dark:text-gray-300">
              {categories.map((category) => (
                <div key={category.id} className="flex flex-col">
                  {editCategoryId === category.id ? (
                    <FormCategory
                      initialValue={editInitialValue.name}
                      initialColor={editInitialValue.color}
                      isEditing={true}
                      onSubmit={(newName, newColor) => {
                        handleEditCategory(category.id, newName, newColor);
                        setEditCategoryId(null);
                      }}
                      onCancel={() => setEditCategoryId(null)}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between pr-2 hover:bg-purple-50 dark:hover:bg-gray-800 rounded">
                        <Link
                          to={`/dashboard/categories/${category.link}`}
                          className={`flex items-center gap-2 py-1 px-2 ${
                            currentPath ===
                            `/dashboard/categories/${category.link}`
                              ? "bg-purple-100 dark:bg-purple-700 text-purple-800 dark:text-white font-semibold"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </Link>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditCategoryId(category.id);
                              setEditInitialValue({
                                name: category.name,
                                color: category.color,
                              });
                            }}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Edit
                          </button>
                          {deleteCategoryId !== category.id && (
                            <button
                              onClick={() => {
                                setDeleteCategoryId(category.id);
                              }}
                              className="text-xs ml-2 text-red-600 dark:text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      {deleteCategoryId === category.id && (
                        <div className="flex justify-end mr-2">
                          <ConfirmDelete
                            onConfirm={() => {
                              handleDeleteCategory(category.id);
                              setDeleteCategoryId(null);
                            }}
                            onCancel={() => {
                              setDeleteCategoryId(null);
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              {showForm ? (
                <li>
                  <FormCategory
                    onSubmit={handleAddCategories}
                    onCancel={() => setShowForm(false)}
                  />
                </li>
              ) : (
                <li
                  onClick={() => setShowForm(true)}
                  className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  + Add new
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 mb-4 flex flex-col items-center">
        <Link to="/logout" className="logout-text">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition">
            <FontAwesomeIcon icon={faRightFromBracket} />
            Logout
          </div>
        </Link>
      </div>
    </aside>
  );
}
