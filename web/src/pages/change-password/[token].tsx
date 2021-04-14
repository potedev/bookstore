import { NextPage } from "next";
import React, { useState } from "react";
import { useFormik } from "formik";
import Wrapper from "../../components/wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { toErrorMap } from "../../utils/toArrorMap";
import { useRouter } from "next/router";
import NextLink from "next/link";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const ChangePassword = ({ token }: any) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");

  const formik = useFormik({
    initialValues: { newPassword: "", newPasswordCopy: "" },
    onSubmit: async (values, { setErrors }) => {
      const response = await changePassword({
        newPassword: values.newPassword,
        newPasswordCopy: values.newPasswordCopy,
        token,
      });

      if (response.data?.changePassword.errors) {
        const errorMap = toErrorMap(response.data.changePassword.errors);

        //If the token has expired
        if ("token" in errorMap) {
          setTokenError(errorMap.token);
        }

        //If passwords don't match
        if ("form" in errorMap) {
          setTokenError(errorMap.form);
        }

        setErrors(errorMap);
      } else if (response.data?.changePassword.user) {
        router.push("/login");
      }
    },
  });

  return (
    <Wrapper>
      <h1>Change password</h1>
      <form onSubmit={formik.handleSubmit}>
        {!tokenError ? null : (
          <div>
            <p style={{ color: "red" }}>{tokenError}</p>
            <NextLink href="/forgot-password">
              <p style={{ color: "blue" }}>Click here to get a new one</p>
            </NextLink>
          </div>
        )}
        <div>
          <label>New password</label>
          <input
            id="newPassword"
            placeholder="Username or email"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
            type="password"
          />

          {formik.errors.newPassword ? (
            <div>{formik.errors.newPassword}</div>
          ) : null}
        </div>
        <div>
          <label>Retype new password</label>
          <input
            id="newPasswordCopy"
            placeholder="Retype new password"
            value={formik.values.newPasswordCopy}
            onChange={formik.handleChange}
            type="password"
          />
          {formik.errors.newPasswordCopy ? (
            <div>{formik.errors.newPasswordCopy}</div>
          ) : null}
        </div>
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }: any) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
