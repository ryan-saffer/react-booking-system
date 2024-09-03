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

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email address is required").email(),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits long"),
  suburb: z.string().min(1, "Suburb is required"),
  state: z
    .enum(["ACT", "NSW", "NT", "QLD", "TAS", "VIC", "WA"])
    .optional()
    .refine((it) => !!it, "Please select a state"),
  experience: z
    .string()
    .min(1, "Please let us know your experience working with kids"),
  interest: z
    .enum(["browsing", "3", "6", "12", "12+"])
    .optional()
    .refine((it) => !!it, "Please select your interest level"),
  enquiry: z.string().min(1, "Please tell us a bit about yourself!"),
  reference: z.string().min(1, "Please enter how you heard about us"),
});

function FranchisingForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      contactNumber: "",
      suburb: "",
      state: undefined,
      experience: undefined,
      interest: undefined,
      enquiry: "",
      reference: "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      await fetch(`${FORM_WEBHOOK}?formId=franchising`, {
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

    form.reset({
      experience: undefined,
      interest: undefined,
      state: undefined,
    });
    toast.success(
      <div className="flex gap-4">
        <CircleCheckBig className="mt-1 h-4 w-4" />
        <div>
          <p className="font-semibold">Enquiry recieved!</p>
          <p>
            We will be in touch soon to discuss things further! Your info pack
            download should begin shortly. 😄
          </p>
        </div>
      </div>,
      {
        duration: 15_000,
      },
    );
    setTimeout(() => {
      window.open(
        `https://www.fizzkidz.com.au/fizz-kidz-franchising-brochure.pdf`,
        "_blank",
      );
    }, 2000);
  }

  return (
    <Form {...form}>
      <Toaster richColors closeButton />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your first name *</FormLabel>
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
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your last name *</FormLabel>
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
          name="suburb"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Which suburb do you want to open a studio in? *
              </FormLabel>
              <p className="text-sm">
                Additionally, our thriving Balwyn and Cheltenham studios are
                available to purchase!
              </p>
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
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Which state is that in?</FormLabel>
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
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ACT">ACT</SelectItem>
                  <SelectItem value="NSW">NSW</SelectItem>
                  <SelectItem value="NT">NT</SelectItem>
                  <SelectItem value="QLD">QLD</SelectItem>
                  <SelectItem value="TAS">TAS</SelectItem>
                  <SelectItem value="VIC">VIC</SelectItem>
                  <SelectItem value="WA">WA</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="experience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Do you have any experience working with kids? *
              </FormLabel>
              <FormControl>
                <Textarea
                  className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="interest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Please select your interest level *</FormLabel>
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
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="browsing">Just browsing</SelectItem>
                  <SelectItem value="3">Get started in 3 months</SelectItem>
                  <SelectItem value="6">Get started in 3-6 months</SelectItem>
                  <SelectItem value="12">Get started in 6-12 months</SelectItem>
                  <SelectItem value="12+">Get started in 12+ months</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="enquiry"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                What interests you about Fizz Kidz? Tell us about you.
              </FormLabel>
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
              <FormLabel>Finally, how did you hear about us? *</FormLabel>
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
        <Button
          className="!mt-8 w-full rounded-full bg-[#9044E2] hover:bg-[#a56ae6] focus-visible:outline-purple-500"
          type="submit"
        >
          {loading ? (
            <LoaderCircle className="h-4 w-4 animate-spin" />
          ) : (
            "DOWNLOAD INFO PACK"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default FranchisingForm;
