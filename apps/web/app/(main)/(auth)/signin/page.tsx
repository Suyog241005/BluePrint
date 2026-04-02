import { SigninForm } from "@/components/auth/signin-form";
import { requireUnauth } from "@/lib/auth-utils";

export default async function Signin() {
  await requireUnauth();
  return (
    <div>
      <SigninForm />
    </div>
  );
}
