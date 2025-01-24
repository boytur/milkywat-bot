import { useAuthContext } from "@/contexts/authContext";
import React, { useEffect } from "react";

interface Props {}

const Login: React.FC<Props> = () => {
  const { authState, login } = useAuthContext();

  useEffect(() => {
    if (authState.isLoggedin) {
      window.location.href = "/";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.isLoggedin]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-tr from-gray-800 via-gray-900 to-black text-white">
      <div className="text-center p-8 bg-gray-800 bg-opacity-90 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-4xl font-extrabold mb-6 text-gray-100">Welcome to Team3 Task Reports</h1>
        <p className="text-lg mb-8 text-gray-300">Streamline your tasks and stay on top of your work.</p>
        <button
          className="bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-3 px-8 rounded-md shadow-lg transition-transform transform hover:scale-105"
          onClick={() => {
            login(); // Call the login logic
          }}
        >
          Login with Discord
        </button>
      </div>
    </div>
  );
};

export default Login;
