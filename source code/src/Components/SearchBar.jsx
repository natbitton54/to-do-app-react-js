import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useCallback, useEffect, useState } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";

export default function SearchBar({ setSearchResults, filter = "all" }) {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();

  const handleSearchTask = useCallback(async () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setSearchResults(null);
      return;
    }

    if (!user?.uid) return;

    const constraints = [
      orderBy("titleLower"),
      where("titleLower", ">=", term),
      where("titleLower", "<=", term + "\uf8ff"),
    ];

    // add "done" equality only if a filter is chosen
    if (filter === "done") {
      constraints.unshift(where("done", "==", true)); // only done
    } else if (filter === "notDone") {
      constraints.unshift(where("done", "==", false)); // only not-done
    } // filter === "all" → no done clause at all

    const q = query(collection(db, "users", user.uid, "tasks"), ...constraints);

    const snap = await getDocs(q);
    const tasks = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setSearchResults(tasks);
  }, [searchTerm, setSearchResults, user, filter]);

  useEffect(() => {
    const id = setTimeout(handleSearchTask, 300);

    return () => clearTimeout(id);
  }, [handleSearchTask]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSearchTask();
      }}
      className="relative flex-grow"
    >
      <button
        type="submit"
        className="absolute inset-y-0 left-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
        title="Search"
      >
        <FaSearch />
      </button>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search tasks..."
        className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {searchTerm && (
        <button
          onClick={() => {
            setSearchTerm("");
            setSearchResults(null);
          }}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-white"
        >
          <FaTimes />
        </button>
      )}
    </form>
  );
}
