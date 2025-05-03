
import { Navigate } from "react-router-dom";
import { useBork } from "@/context/BorkContext";

const Index = () => {
  const { connected } = useBork();
  
  // If user is connected, redirect to tasks, otherwise redirect to home
  return <Navigate to={connected ? "/tasks" : "/"} replace />;
};

export default Index;
