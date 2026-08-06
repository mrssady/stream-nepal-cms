"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

import { login } from "@/services/auth";
import { saveToken } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("sadab@example.com");
  const [password, setPassword] = useState("12345678");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>,
  ) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const data = await login({
        email,
        password,
      });

      saveToken(data.access_token);

      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Login failed",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">
          Stream Nepal CMS
        </h1>

        <p className="mt-2 text-slate-500">
          Sign in to continue
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
        />

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button
          type="submit"
          loading={loading}
        >
          Login
        </Button>
      </form>
    </Card>
  );
}