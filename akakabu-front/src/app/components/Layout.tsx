import React from "react";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="rows-[auto_1fr_auto] relative grid min-h-screen bg-green-100">
      <main className="grid place-items-center pt-16 pb-16">
        <Outlet />
      </main>
    </div>
  );
}
