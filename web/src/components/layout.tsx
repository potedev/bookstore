import React from "react";
import NavBar from "./navBar";
import Wrapper from "./wrapper";

interface layoutProps {}

const layout: React.FC<layoutProps> = ({ children }) => {
  return (
    <>
      <NavBar />
      <Wrapper children={children} />
    </>
  );
};

export default layout;
