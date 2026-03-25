import { AuthLayout } from "@/components/auth/authLayout"

export default function AuthLayoutPage({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthLayout>{children}</AuthLayout>
}
