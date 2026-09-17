"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

import Card from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/button";

import { verifyEmail, resendVerification } from "@/services/auth";

export default function VerifyEmailForm({ token }: { token: string }) {
  const [status, setStatus] = useState<
    "verifying" | "success" | "error" | "idle"
  >(token ? "verifying" : "idle");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) return;

    verifyEmail(token)
      .then(() => {
        setStatus("success");
      })
      .catch((err: unknown) => {
        const message = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : undefined;

        setMessage(message || "Verification failed");
        setStatus("error");
      });
  }, [token]);

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);

      await resendVerification(email);
      setMessage("If the email exists, a verification link was sent.");
      setStatus("idle");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string } | undefined)?.message
        : undefined;

      setMessage(message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (status === "verifying") {
    return (
      <Card>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Verifying your email</h1>
          <p className="mt-2 text-slate-500">Please wait a moment...</p>
        </div>
      </Card>
    );
  }

  if (status === "success") {
    return (
      <Card>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Email verified</h1>
          <p className="mt-2 text-slate-500">
            Your email has been verified successfully.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-indigo-600 hover:underline"
          >
            Go to login
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-slate-500">
          {message || "Enter your email to resend the verification link"}
        </p>
      </div>

      <form onSubmit={handleResend} className="space-y-5">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Resend verification link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link
          href="/login"
          className="font-medium text-indigo-600 hover:underline"
        >
          Back to login
        </Link>
      </p>
    </Card>
  );
}
