"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { IoIosMail } from "react-icons/io";
import { CircleCheckBig } from "lucide-react";
import { Frown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/actions/verify-email";
import { verifyCode } from "@/actions/verify-code";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { FormSuccess } from "@/components/form-success";
import { FormError } from "@/components/form-error";
import { OtpSchema } from "@/schemas";
import { Countdown } from "@/components/auth/countdown";

export const VerifyEmailForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isCodeSubmitted, setIsCodeSubmitted] = useState(false);

  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email") || "you";
  const expires = searchParams.get("expires");

  // Initialize form with Zod schema resolver
  const form = useForm<z.infer<typeof OtpSchema>>({
    resolver: zodResolver(OtpSchema),
  });

  // Function to handle token verification
  const onSubmitToken = useCallback(() => {
    if (!token) {
      // If token is missing from searchParams
      setError("Invalid Link!");
      return;
    }
    verifyEmail(token)
      .then((data) => {
        setError(data?.error);
      })
      .catch(() => {
        setError("Verification issue encountered!");
      });
  }, [token]);

  // Function to handle OTP code submission
  const onSubmitCode = (values: z.infer<typeof OtpSchema>) => {
    setIsCodeSubmitted(true);
    setError("");
    setSuccess("");

    if (!token || !values) {
      setError("Invalid code!");
      return;
    }

    verifyCode(token, values.code)
      .then((data) => {
        setIsCodeSubmitted(false);
        setSuccess(data.success);
        setError(data.error);
      })
      .catch(() => {
        setError("Error verifying code!");
      });
  };

  useEffect(() => {
    onSubmitToken();
  }, [onSubmitToken]);

  return (
    <CardWrapper
      icon={
        success ? (
          <CircleCheckBig
            size="60"
            className="text-white bg-green-400 rounded-full"
          />
        ) : error ? (
          <Frown size="60" className="text-white bg-red-400 rounded-full" />
        ) : (
          <IoIosMail size="60" color="#9e85ed" />
        )
      }
      headerLabel={
        success
          ? "Verification Success"
          : error
          ? "Verification Failed"
          : isCodeSubmitted
          ? "Verifying your Information"
          : "Verify your Email Address"
      }
      separator
      headerSubLabel={
        success
          ? "Welcome! Thrilled to have you with us."
          : error
          ? "There was a problem when trying to verify your email."
          : isCodeSubmitted
          ? "Please wait while we process your request."
          : ""
      }
      backButtonLink="Return to Login"
      backButtonHref="/auth/login"
    >
      <div className="w-full flex flex-col place-content-center gap-5">
        {success ? (
          <p className="paragraph">
            Thank you for your support, we are pleased to inform you that your
            account is now ready for use. You can now sign in with your email
            address.
          </p>
        ) : error ? (
          <p className="paragraph">
            Please contact us if this error persists. Unique error code:{" "}
            <code className="rounded-sm bg-slate-100 p-1 text-xs">{error}</code>
          </p>
        ) : (
          <>
            {!isCodeSubmitted ? (
              <div>
                <p className="paragraph inline">
                  Enter the 6-digit code we sent to {email} to continue. This
                  code will expire in
                </p>
                <Countdown expiration={Number(expires)} />
              </div>
            ) : (
              <Loader size="lg" />
            )}
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitCode)}
                className="w-full space-y-8 max-w-3xl mx-auto"
              >
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password:</FormLabel>
                      <FormControl>
                        <InputOTP maxLength={6} {...field}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="button"
                  disabled={isCodeSubmitted}
                >
                  Verify Code
                </Button>
              </form>
            </Form>
          </>
        )}
        {success && <FormSuccess message={success} />}
        {error && <FormError message={error} />}

        {!success && (
          <div className="w-full flex justify-evenly">
            <Button
              variant="link"
              className="link text-accent-highlight !font-semibold"
              // TODO: Implement resend code logic here
            >
              Resend code
            </Button>
            <Button
              variant="link"
              className="link text-accent-highlight !font-semibold"
            >
              {error ? "Go back" : "Change email"}
            </Button>
          </div>
        )}
      </div>
    </CardWrapper>
  );
};