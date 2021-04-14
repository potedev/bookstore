import { useFormik } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React, { useState } from "react";
import Wrapper from "../components/wrapper";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import { useForgotPasswordMutation } from "../generated/graphql";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [, forgotPassword] = useForgotPasswordMutation();
  const [complete, setComplete] = useState(false);

  const formik = useFormik({
    initialValues: { email: "" },
    onSubmit: async (values) => {
      await forgotPassword(values);
      setComplete(true);
    },
  });

  return (
    <Wrapper>
      <div>
        <h1>Forgot password</h1>
        {complete ? (
          <p>If an account with that email exists, we sent you an email</p>
        ) : (
          <form onSubmit={formik.handleSubmit}>
            <div>
              <label>email</label>
              <input
                id="email"
                placeholder="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                type="email"
              />

              {formik.errors.email ? <div>{formik.errors.email}</div> : null}
            </div>
            <button type="submit">Submit</button>
          </form>
        )}
        {/* <NextLink href="/forgot-password">
          <p style={{ color: "blue" }}>Forgot password ?</p>
        </NextLink> */}
      </div>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(ForgotPassword);
