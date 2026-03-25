"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@workspace/better-auth/client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

const signinSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
})

type SignInFormValues = z.infer<typeof signinSchema>

export const SigninForm = () => {
  const router = useRouter()
  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const onSubmit = async (values: SignInFormValues) => {
    console.log(values)
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: `${process.env.NEXT_PUBLIC_FRONTEND_URL}`,
      },
      {
        onSuccess: () => {
          toast.success("Signed in successfully")
          form.reset()
          router.push(`${process.env.NEXT_PUBLIC_FRONTEND_URL}`)
        },
        onError: (ctx) => {
          console.log(ctx.error)
          toast.error(ctx.error.message)
        },
      }
    )
  }
  const isPending = form.formState.isSubmitting

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Get Started</CardTitle>
          <CardDescription>Create your account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} id="signin">
            <div className="grid gap-6">
              <div className="grid gap-6">
                <FieldGroup>
                  <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signin-email">Email</FieldLabel>
                        <Input
                          type="email"
                          placeholder="m@example.com"
                          id="signin-email"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                  <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor="signin-password">
                          Password
                        </FieldLabel>
                        <Input
                          type="password"
                          placeholder="********"
                          id="signin-password"
                          {...field}
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Button type="submit" disabled={isPending} className="w-full">
                    Sign In
                  </Button>
                </FieldGroup>
              </div>
              <div className="text-center text-sm">
                Don't have an account?{" "}
                <Link
                  href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/signup`}
                  className="underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
