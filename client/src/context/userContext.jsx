import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const useUserContext = () => {
  const context = useContext(UserContext);

  return context;
};

export const UserContextProvider = ({ children }) => {
  const [userId, setUserId] = useState(false);
  const login = (newUserId) => {
    setUserId(newUserId);
  };
  return (
    <UserContext.Provider value={{ userId, login }}>
      {children}
    </UserContext.Provider>
  );
};
