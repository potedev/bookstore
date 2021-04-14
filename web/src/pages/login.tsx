import { useFormik } from "formik";
import { withUrqlClient } from "next-urql";
import router from "next/router";
import React from "react";
import Wrapper from "../components/wrapper";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toArrorMap";
import NextLink from "next/link";

interface loginProps {}

const Login: React.FC<loginProps> = ({}) => {
  const [, login] = useLoginMutation();

  const formik = useFormik({
    initialValues: { usernameOrEmail: "", password: "" },
    onSubmit: async (values, { setErrors }) => {
      const response = await login(values);

      if (response.data?.login.errors) {
        setErrors(toErrorMap(response.data.login.errors));
      } else if (response.data?.login.user) {
        //worked
        router.push("/");
      }
    },
  });

  return (
    <Wrapper>
      <div>
        <h1>Login page</h1>
        <form onSubmit={formik.handleSubmit}>
          <div>
            <label>Username or email</label>
            <input
              id="usernameOrEmail"
              placeholder="Username or email"
              value={formik.values.usernameOrEmail}
              onChange={formik.handleChange}
              type="text"
            />

            {formik.errors.usernameOrEmail ? (
              <div>{formik.errors.usernameOrEmail}</div>
            ) : null}
          </div>
          <div>
            <label>Password</label>
            <input
              id="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              type="password"
            />
            {formik.errors.password ? (
              <div>{formik.errors.password}</div>
            ) : null}
          </div>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
        <NextLink href="/forgot-password">
          <p style={{ color: "blue" }}>Forgot password ?</p>
        </NextLink>
      </div>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Login);
