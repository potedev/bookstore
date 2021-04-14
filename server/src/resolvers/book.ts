import { Resolver, Query, Arg, Mutation } from 'type-graphql';
import { Book } from '../entities/Book';

@Resolver()
export class BookResolver {
  @Query(() => [Book])
  async books(): Promise<Book[]> {
    // await sleep(3000);
    return Book.find();
  }

  @Query(() => Book, { nullable: true })
  book(@Arg('id') _id: number): Promise<Book | undefined> {
    return Book.findOne(_id)
  }

  @Mutation(() => Book)
  async createBook(@Arg('title') title: string,): Promise<Book> {
    return Book.create({ title }).save();
  }

  @Mutation(() => Book, { nullable: true })
  async updateBook(
    @Arg('id') _id: number,
    @Arg('title', () => String, { nullable: true }) title: string,
  ): Promise<Book | null> {
    const book = await Book.findOne(_id);

    if (!book) {
      return null;
    }

    if (typeof title !== 'undefined') {
      await Book.update({ _id }, { title });
    }

    return book;
  }

  @Mutation(() => Boolean)
  async deleteBook(@Arg('id') _id: number,): Promise<boolean> {
    await Book.delete(_id)
    return true;
  }
}
