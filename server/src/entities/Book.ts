import { Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Entity, BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Book extends BaseEntity{
  @Field()
  @PrimaryGeneratedColumn()
  _id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  title!: string;
}
