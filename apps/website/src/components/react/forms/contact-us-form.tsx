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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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

const formSchema = z
  .object({
    name: z.string().min(1, "Contact name is required"),
    email: z.string().min(1, "Email address is required").email(),
    contactNumber: z
      .string()
      .min(10, "Contact number must be at least 10 digits long"),
    service: z
      .enum([
        "party",
        "holiday-program",
        "after-school-program",
        "incursion",
        "activation",
        "other",
      ])
      .optional()
      .refine((it) => !!it, {
        message: "Please select which experience you are interested in",
      }),
    location: z
      .enum(["balwyn", "cheltenham", "essendon", "malvern", "at-home", "other"])
      .optional(),
    suburb: z.string().optional(),
    preferredDateAndTime: z.string().optional(),
    enquiry: z.string().min(1, "Please enter an enquiry"),
  })
  .superRefine((val, ctx) => {
    if (val.service === "party" || val.service === "holiday-program") {
      if (!val.location) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please choose a location",
          path: ["location"],
        });
      }
    }
    if (val.service === "party") {
      if (!val.preferredDateAndTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter your preferred date and time",
          path: ["preferredDateAndTime"],
        });
      }
    }
    if (val.service === "party" && val.location === "at-home") {
      if (!val.suburb) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter your suburb",
          path: ["suburb"],
        });
      }
    }
  });

function ContactUsForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      service: undefined,
      location: undefined,
      suburb: "",
      preferredDateAndTime: "",
      enquiry: "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      await fetch(`${FORM_WEBHOOK}?formId=contact`, {
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

    form.reset({ service: undefined, location: undefined, suburb: "" });
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
          name="service"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Which Fizz Kidz experience are you interested in?
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                    aria-label="select experience"
                  >
                    {field.value ? <SelectValue /> : "Select experience"}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="party">Birthday Party</SelectItem>
                  <SelectItem value="holiday-program">
                    Holiday Program
                  </SelectItem>
                  <SelectItem value="after-school-program">
                    After School Program
                  </SelectItem>
                  <SelectItem value="incursion">School Incursion</SelectItem>
                  <SelectItem value="activation">
                    Activation and Events
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {(form.watch("service") === "party" ||
          form.watch("service") === "holiday-program") && (
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Which location are you interested in?</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger
                      className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                      aria-label="select experience"
                    >
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="balwyn">Balwyn</SelectItem>
                    <SelectItem value="cheltenham">Cheltenham</SelectItem>
                    <SelectItem value="essendon">Essendon</SelectItem>
                    <SelectItem value="malvern">Malvern</SelectItem>
                    <SelectItem value="at-home">At Home</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {form.watch("service") === "party" &&
          form.watch("location") === "at-home" && (
            <FormField
              control={form.control}
              name="suburb"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Which suburb do you live in? *</FormLabel>
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
          )}
        {form.watch("service") === "party" && (
          <FormField
            control={form.control}
            name="preferredDateAndTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred date and time *</FormLabel>
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
        )}
        <FormField
          control={form.control}
          name="enquiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your enquiry *</FormLabel>
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

export default ContactUsForm;
