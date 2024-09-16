import React from "react";

const LogoutDialog = ({ isOpen, onClose, onLogout }) => {
  return (
    <div
      className={`absolute top-100  right-0 left-0  bg-slate-50 m-auto  rounded sm:w-1/2 p-8 shadow-lg text-center ${
        isOpen ? "block" : "hidden"
      }`}
    >
      <p className="font-bold">Are you sure you want to logout ?</p>
      <div className="flex justify-center mt-4">
        <button
          onClick={onLogout}
          className="mr-4 text-center bg-red-600 text-white px-2 rounded"
        >
          Logout
        </button>
        <button
          onClick={onClose}
          className="border px-4 py-2  bg-indigo-600 text-white  rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default LogoutDialog;
