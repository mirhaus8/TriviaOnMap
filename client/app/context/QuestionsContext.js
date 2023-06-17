import React, { createContext, useState } from 'react';

export const MyContext = createContext();

export const QuestionsContext = ({ children }) => {
  const [questionList, setQuestionList] = useState(['hi']);
  const [deletedGames, setDeletedGames] = useState([]);

  return (
    <MyContext.Provider value={{ questionList, setQuestionList, deletedGames, setDeletedGames }}>
      {children}
    </MyContext.Provider>
  );
};