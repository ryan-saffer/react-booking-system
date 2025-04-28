import "@/styles/sonner.css";

import { CircleCheckBig, LoaderCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  SelectContent,
  SelectForm,
  SelectItem,
  SelectValue,
} from "../ui/select";

import { Button } from "../ui/button";
import { FORM_WEBHOOK } from "@/utils/constants";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Toaster } from "../ui/sonner";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const SESSIONS = [
  "Creative Kinders Tuesday 10am",
  "All Play Wednesdays 11:15am",
  "Little Explorers Thursdays 10am",
] as const;

const SESSION_TYPES = ["Casual Session", "Term Enrolment"] as const;

type Form = z.infer<typeof formSchema>;
const formSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  email: z.string().min(1, "Email address is required").email(),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits long"),
  location: z
    .enum(["balwyn", "cheltenham", "essendon", "kingsville", "malvern"])
    .optional()
    .refine((it) => !!it, "Please select a location"),
  session: z
    .enum(SESSIONS)
    .optional()
    .refine((it) => !!it, "Please select a session you are interested in."),
  type: z
    .enum(SESSION_TYPES)
    .optional()
    .refine(
      (it) => !!it,
      "Please select the session type you are interested in",
    ),
  enquiry: z.string().optional(),
  reference: z
    .enum(["google", "instagram", "word-of-mouth", "attended-fizz", "other"])
    .optional()
    .refine((it) => !!it, {
      message: "Please select how you heard about us",
    }),
  referenceOther: z.string().optional(),
});

function PartyLabForm() {
  const form = useForm<Form>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      location: undefined,
      session: undefined,
      enquiry: "",
      reference: undefined,
      referenceOther: "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: Form) {
    setLoading(true);

    try {
      await fetch(`${FORM_WEBHOOK}?formId=party`, {
        body: JSON.stringify(values),
        method: "POST",
        mode: "no-cors",
      });
    } catch (err) {
      console.error({ err });
      toast.error(
        "There was an error submitting the form. Please send us an email at 'bookings@fizzkidz.com.au'.",
      );
      return;
    } finally {
      setLoading(false);
    }

    form.reset({ location: undefined });
    toast.success(
      <div className="flex gap-4">
        <CircleCheckBig className="mt-1 h-4 w-4" />
        <div>
          <p className="font-semibold">Enquiry recieved!</p>
          <p>
            We aim to get back to every enquiry within the same business day. 😄
          </p>
        </div>
      </div>,
      {
        duration: 15_000,
      },
    );
  }

  return (
    <Form {...form}>
      <Toaster richColors closeButton />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name *</FormLabel>
              <FormControl>
                <Input
                  className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your email *</FormLabel>
              <FormControl>
                <Input
                  className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="contactNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your best contact number *</FormLabel>
              <FormControl>
                <Input
                  className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <SelectForm
                label="Which location are you interested in?"
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectValue />
                <SelectContent>
                  <SelectItem value="balwyn">Balwyn</SelectItem>
                  <SelectItem value="cheltenham">Cheltenham</SelectItem>
                  <SelectItem value="essendon">Essendon</SelectItem>
                  <SelectItem value="kingsville">Kingsville</SelectItem>
                  <SelectItem value="malvern">Malvern</SelectItem>
                </SelectContent>
              </SelectForm>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="session"
          render={({ field }) => (
            <FormItem>
              <SelectForm
                label="Which session are you interested in?"
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectValue />
                <SelectContent>
                  {SESSIONS.map((session) => (
                    <SelectItem key={session} value={session}>
                      {session}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectForm>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <SelectForm
                label="Which type of session are you interested in?"
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectValue />
                <SelectContent>
                  {SESSION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectForm>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enquiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Optional enquiry</FormLabel>
              <FormControl>
                <Textarea
                  className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                  rows={5}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <SelectForm
                label="How did you hear about us?"
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectValue />
                <SelectContent>
                  <SelectItem value="google">Google search</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="word-of-mouth">Word of mouth</SelectItem>
                  <SelectItem value="attended-fizz">
                    Attended a Fizz Kidz experience
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </SelectForm>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("reference") === "other" && (
          <FormField
            control={form.control}
            name="referenceOther"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ooh interesting! Please share 🙏</FormLabel>
                <FormControl>
                  <Textarea
                    className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button
          className="!mt-8 w-full rounded-full bg-[#9044E2] hover:bg-[#a56ae6] focus-visible:outline-purple-500"
          type="submit"
        >
          {loading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default PartyLabForm;
