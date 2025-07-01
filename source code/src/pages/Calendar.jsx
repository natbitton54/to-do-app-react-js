import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import Sidenav from "./Sidenav";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

export default function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "tasks"),
      (snapshot) => {
        const eventList = snapshot.docs.map((doc) => {
          const now = new Date();
          const tasks = doc.data();
          const due = new Date(tasks.due);

          let status = "pending";
          if (tasks.done) status = "done";
          else if (due < now) status = "overdue";
          const colorMap = {
            overdue: "#ef4444", // red
            done: "#22c55e", // green
            pending: tasks.color || "#6366f1", // default color
          };

          return {
            id: doc.id,
            title: tasks.title,
            start: tasks.due,
            allDay: false,
            backgroundColor: colorMap[status],
            borderColor: colorMap[status],
            extendedProps: { ...tasks, status },
          };
        });
        setEvents(eventList);
      }
    );

    return () => unsubscribe();
  }, [user]);
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-slate-900">
      <Sidenav />

      <main className="flex-1 overflow-y-auto mt-20 ml-4 mr-2 md:mt-10">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={isMobile ? "timeGridDay" : "dayGridMonth"}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: isMobile
              ? "timeGridDay"
              : "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          height="auto"
          events={events}
          eventTimeFormat={{
            hour: "numeric",
            minute: "numeric",
            hour12: true,
            meridiem: "short",
          }}
          eventDidMount={(info) => {
            const { status } = info.event.extendedProps;
            const label =
              {
                overdue: "⏰ Overdue",
                pending: "🔖 Pending",
                done: "✅ Done",
              }[status] || "Task";

            tippy(info.el, {
              content: label,
              placement: "top",
              arrow: false,
            });
          }}
          selectable
          selectMirror
          select={(info) =>
            console.log("User selected range:", info.startStr, info.endStr)
          }
          eventClick={(info) => console.log("Event clicked:", info.event.id)}
        />
      </main>
    </div>
  );
}
