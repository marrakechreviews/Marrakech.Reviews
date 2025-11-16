import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';

export default function AdminDashboardPage() {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-800 text-white min-h-screen p-4">
        <h2 className="text-2xl font-bold mb-4">Admin</h2>
        <nav>
          <ul>
            <li>
              <NavLink to="/admin/free-reservations" className="block py-2 px-4 rounded hover:bg-gray-700">
                Free Reservations
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
