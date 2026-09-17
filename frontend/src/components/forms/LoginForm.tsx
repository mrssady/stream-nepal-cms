"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";

import { login } from "@/services/auth";
import { saveToken, saveUser } from "@/lib/auth";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] =
    useState("sadab@example.com");

  const [password, setPassword] =
    useState("12345678");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

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
      saveUser(data.user);

      const nextParam = new URLSearchParams(
        window.location.search,
      ).get("next");

      router.push(nextParam || "/dashboard");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)
            ?.message
        : undefined;

      setError(message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Card>
  );
}