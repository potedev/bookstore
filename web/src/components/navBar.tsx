import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface navBarProps {}

const NavBar: React.FC<navBarProps> = ({}) => {
  const [, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });
  let body = null;

  console.log("data", data);

  //Data loading
  if (fetching) {
    body = <div>loading</div>;
  } else if (!data?.me) {
    body = (
      <div>
        <ul>
          <li>
            <NextLink href="/login">
              <p>login</p>
            </NextLink>
          </li>
          <li>
            <NextLink href="/register">
              <p>register</p>
            </NextLink>
          </li>
        </ul>
      </div>
    );
  } else {
    body = (
      <div>
        <p>Hello {data.me.username}</p>
        <p onClick={() => logout()}>logout</p>
      </div>
    );
  }

  return body;
};

export default NavBar;
