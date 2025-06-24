import React, { useEffect, useState } from "react";

export default function FormCategory({
  onSubmit,
  onCancel,
  initialValue = "",
  initialColor = "#a78bfa",
  isEditing = false,
}) {
  const [name, setName] = useState(initialValue);
  const [color, setColor] = useState(initialColor);

  useEffect(() => {
    setName(initialValue);
    setColor(initialColor);
  }, [initialValue, initialColor]);

  function handleSubmit(e) {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), color);
      setName("");
      setColor("#a78bfa");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-3 text-sm">
      <input
        type="text"
        placeholder="Category Name"
        className="border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
  
      <div className="flex items-center gap-3">
        <label
          htmlFor="colorPicker"
          className="text-gray-700 dark:text-gray-300 font-medium"
        >
          Pick a color:
        </label>
        <input
          type="color"
          id="colorPicker"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 p-0 border border-gray-300 dark:border-gray-600 bg-transparent rounded cursor-pointer"
        />
      </div>
  
      <div className="flex gap-2 mt-1">
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-1.5 rounded-md hover:bg-purple-700 transition"
        >
          {isEditing ? "Save" : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 dark:text-gray-400 hover:underline"
        >
          Cancel
        </button>
      </div>
    </form>
  );
  
}
