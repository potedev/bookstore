import React from "react";

interface WrapperProps {}

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return (
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>{children}</div>
  );
};

export default Wrapper;
