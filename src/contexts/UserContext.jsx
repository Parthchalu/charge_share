import React, { createContext, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children, user }) => {
  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};