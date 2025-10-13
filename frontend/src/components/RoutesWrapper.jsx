
import RoutePaths from "../constants/RoutePaths";
import { Routes, Route } from "react-router-dom";

const RoutesWrapper = () => {
  return (
    <Routes>
      {
        RoutePaths.map(({ path, elements}, index) => (
          <Route key={index} path={path} element={elements} />
        ))
      }
    </Routes>
  );
};

export default RoutesWrapper;
