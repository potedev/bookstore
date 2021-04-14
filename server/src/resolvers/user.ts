import { Resolver, Field, Mutation, Arg, ObjectType, Ctx, Query } from 'type-graphql';
import { User } from '../entities/User'
import argon2 from 'argon2'
import { MyContext } from '../types';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { UsernamePasswordInput } from './usernamePasswordInput';
import { validateRegsiter } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid'

@ObjectType()
class FieldError {
    @Field()
    field: string

    @Field()
    message: string
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[]

    @Field(() => User, { nullable: true })
    user?: User
}

@Resolver()
export class UserResolver {

    @Mutation(() => UserResponse)
    async changePassword(
        @Arg('token') token: string,
        @Arg('newPassword') newPassword: string,
        @Arg('newPasswordCopy') newPasswordCopy: string,
        @Ctx() { redis }: MyContext
    ): Promise<UserResponse> {

        if (newPassword.length <= 2) {
            return {
                errors: [
                    {
                        field: 'newPassword',
                        message: 'Length must be greater than 2'
                    }
                ]
            }
        }

        if (newPasswordCopy.length <= 2) {
            return {
                errors: [
                    {
                        field: 'newPasswordCopy',
                        message: 'Length must be greater than 2'
                    }
                ]
            }
        }

        if (newPassword !== newPasswordCopy) {
            return {
                errors: [
                    {
                        field: 'form',
                        message: "Passwords don't match"
                    }
                ]
            }
        }

        const key = FORGET_PASSWORD_PREFIX + token;
        const userId = await redis.get(key);

        if (!userId) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: "token expired"
                    }
                ]
            }
        }

        const user = await User.findOne({ _id: userId })

        if (!user) {
            return {
                errors: [
                    {
                        field: 'token',
                        message: "user no longer exists"
                    }
                ]
            }
        }

        await User.update(
            { _id: userId },
            {
                password: await argon2.hash(newPassword),
            }
        );

        await redis.del(key);

        return { user }
    }


    @Mutation(() => Boolean)
    async forgotPassword(
        @Arg('email') email: string,
        @Ctx() { redis }: MyContext
    ) {
        const user = await User.findOne({ where: { email } })

        console.log('user', user)

        if (!user) {
            //The email isn't in the database
            return true
        }

        const token = v4();


        redis.set(
            FORGET_PASSWORD_PREFIX + token,
            user._id,
            'ex',
            1000 * 60 * 60 * 24 * 3 //3 day
        )

        await sendEmail(
            email,
            `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
        );

        return true
    }


    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req }: MyContext
    ) {
        //You are not logged in

        if (!req.session.userId) {
            return null;
        }

        const user = await User.findOne(req.session.userId)
        return user;
    }

    @Mutation(() => UserResponse)
    async register(@Arg('options') options: UsernamePasswordInput): Promise<UserResponse> {

        const errors = validateRegsiter(options)

        if (errors) {
            return { errors }
        }


        const hashedPassword = await argon2.hash(options.password)

        let user;

        try {
            user = await User.create({
                username: options.username,
                password: hashedPassword,
                email: options.email
            }).save();
        }
        catch (err) {

            //TODO determine either it's an email or username dupplicate entrey
            //Need to have a better sql response about the field, typeORM is giving us an id table;

            if (err.code === 'ER_DUP_ENTRY' && err.message.includes('@')) {
                return {
                    errors: [
                        {
                            field: 'email',
                            message: 'email already used'
                        }
                    ]
                }
            }

            if (err.code === 'ER_DUP_ENTRY') {
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'username already used'
                        }
                    ]
                }
            }
        }

        return {
            user
        };
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('usernameOrEmail') usernameOrEmail: string,
        @Arg('password') password: string,
        @Ctx() { req }: MyContext
    ): Promise<UserResponse> {
        const user = await User.findOne(
            usernameOrEmail.includes('@')
                ? { email: usernameOrEmail }
                : { username: usernameOrEmail }
        );

        if (!user) {
            return {
                errors: [
                    {
                        field: 'usernameOrEmail',
                        message: "Username or email doesn't exist"
                    }
                ]
            }
        }

        const valid = await argon2.verify(user.password, password)

        if (!valid) {
            return {
                errors: [{
                    field: 'password',
                    message: "Incorrect password"
                }]
            }
        }

        req.session.userId = user._id;

        return {
            user
        };
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {

        return new Promise(resolve =>
            req.session.destroy(err => {
                res.clearCookie(COOKIE_NAME);

                if (err) {
                    console.log('Destroying session error:', err)
                    resolve(false)
                    return
                }

                resolve(true)
            })
        );
    }
}


