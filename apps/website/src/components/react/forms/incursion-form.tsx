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
  SelectForm,
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
  name: z.string().min(1, "Contact name is required"),
  school: z.string().min(1, "School name is required"),
  email: z.string().min(1, "Email address is required").email(),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits long"),
  preferredDateAndTime: z
    .string()
    .min(1, "Please enter a preferred date and time"),
  module: z
    .enum([
      "chemicalScience",
      "pushAndPull",
      "lightAndSound",
      "earthWeatherSustainability",
      "notSure",
    ])
    .optional()
    .refine((it) => !!it, "Please select a module"),
  enquiry: z.string().min(1, "Please enter an enquiry"),
});

function IncursionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      school: "",
      email: "",
      contactNumber: "",
      preferredDateAndTime: "",
      module: undefined,
      enquiry: "",
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      await fetch(`${FORM_WEBHOOK}?formId=incursion`, {
        body: JSON.stringify(values),
        method: "POST",
        mode: "no-cors",
      });
    } catch (err) {
      console.error(err);
      toast.error(
        "There was an error submitting the form. Please send us an email at 'bookings@fizzkidz.com.au'.",
      );
      return;
    } finally {
      setLoading(false);
    }

    form.reset();
    setLoading(false);

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
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name of school *</FormLabel>
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
        <FormField
          control={form.control}
          name="module"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Science Module *</FormLabel>
              <SelectForm
                label="Science Module *"
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectValue />
                <SelectContent>
                  <SelectItem value="chemicalScience">
                    Chemical Science
                  </SelectItem>
                  <SelectItem value="pushAndPull">Push and Pull</SelectItem>
                  <SelectItem value="lightAndSound">Light and Sound</SelectItem>
                  <SelectItem value="earthWeatherSustainability">
                    Earth, Weather and Sustainability
                  </SelectItem>
                  <SelectItem value="notSure">
                    A combination of the above / not sure
                  </SelectItem>
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

export default IncursionForm;
