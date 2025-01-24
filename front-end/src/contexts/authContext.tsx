import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { LocalStorage } from "@/utils/LocalStorage";
import axios from "axios";
import { User } from "@/interfaces/User.interface";

interface Auth {
  isLoggedin: boolean;
  isFetching: boolean;
}

type AuthContextType = {
  user: User;
  setUser: (user: User) => void;
  authState: Auth;
  setAuthState: (authState: Auth) => void;
  login: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthContextProviderProps = {
  children: ReactNode;
};

export function AuthContextProvider({ children }: AuthContextProviderProps) {
  const [authState, setAuthState] = useState<Auth>({
    isLoggedin: false,
    isFetching: true,
  });

  const [user, setUser] = useState<User>({
    discord_id: "",
    user_fname: "",
    user_lname: "",
    avatar: "",
  });

  const redirectUrl = import.meta.env.VITE_REDIRECT_URI;
  const login = () => {
    window.location.href = redirectUrl;
  };

  const token = LocalStorage.getItem("reff_tk");

  const refresh = async () => {
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL;
      const response = await axios.post(
        `${baseUrl}/auth/refresh`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status == 200) {
        const data = response.data;
        setUser({
          discord_id: data.user.discord_id,
          user_fname: data.user.user_fname,
          user_lname: data.user.user_lname,
          avatar: data.user.avatar,
        });

        LocalStorage.setItem("acc_tk", data.acc_tk);

        setAuthState({
          isLoggedin: true,
          isFetching: false,
        });
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setAuthState({
        isLoggedin: false,
        isFetching: false,
      });
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, setUser, setAuthState, authState, login }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      "useAuthContext must be used within an AuthContextProvider"
    );
  }
  return context;
}
