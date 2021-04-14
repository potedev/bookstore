import React from "react";
import { useRouter } from "next/router";

import { useFormik } from "formik";
import { useRegisterMutation } from "../generated/graphql";

import Wrapper from "../components/wrapper";
import { toErrorMap } from "../utils/toArrorMap";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const router = useRouter();
  const [, register] = useRegisterMutation();

  const formik = useFormik({
    initialValues: { username: "", password: "", email: "" },
    onSubmit: async (values, { setErrors }) => {
      const response = await register({ options: values });

      if (response.data?.register.errors) {
        setErrors(toErrorMap(response.data.register.errors));
      } else if (response.data?.register.user) {
        //worked
        router.push("/login");
      }
    },
  });

  return (
    <Wrapper>
      <div>
        <h1>Register page</h1>
        <form onSubmit={formik.handleSubmit}>
          <div>
            <label>Username</label>
            <input
              id="username"
              value={formik.values.username}
              onChange={formik.handleChange}
              type="text"
            />

            {formik.errors.username ? (
              <div>{formik.errors.username}</div>
            ) : null}
          </div>
          <div>
            <label>Password</label>
            <input
              id="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              type="password"
            />
            {formik.errors.password ? (
              <div>{formik.errors.password}</div>
            ) : null}
          </div>
          <div>
            <label>Email</label>
            <input
              id="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              type="email"
            />

            {formik.errors.email ? <div>{formik.errors.email}</div> : null}
          </div>
          <div>
            <button type="submit">Submit</button>
          </div>
        </form>
      </div>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: false })(Register);
