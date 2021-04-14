import { Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Entity, BaseEntity } from 'typeorm'
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn("uuid")
  _id!: string;

  @Field()
  @Column({ unique: true, name: 'username' })
  username!: string;

  @Field()
  @Column({ unique: true, name: 'email' })
  email!: string;

  @Column()
  password!: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
