import React from "react";
import NavBar from "../components/navBar";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useBooksQuery } from "../generated/graphql";

import Layout from "../components/layout";

const Index = () => {
  const [{ data }] = useBooksQuery();

  console.log("fetch book", data);

  return (
    <Layout>
      <div>
        {!data ? (
          <p>loading</p>
        ) : (
          data.books.map((book) => <p key={book._id}>{book.title}</p>)
        )}
      </div>
      {data ? data.books[0].title : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
