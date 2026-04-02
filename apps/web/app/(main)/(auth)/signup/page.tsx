import { SignupForm } from "@/components/auth/signup-form";
import { requireUnauth } from "@/lib/auth-utils";

export default async function Signup() {
  await requireUnauth();
  return (
    <div>
      <SignupForm />
    </div>
  );
}
