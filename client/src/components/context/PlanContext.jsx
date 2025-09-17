import { createContext, useState, useContext } from 'react';

export const PlanContext = createContext();

const PlanProvider = ({ children }) => {
  const [tripPlan, setTripPlan] = useState(null);

  return (
    <PlanContext.Provider value={{ tripPlan, setTripPlan }}>
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => useContext(PlanContext);

export default PlanProvider;
