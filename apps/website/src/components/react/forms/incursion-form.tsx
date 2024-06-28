import { CircleCheckBig, LoaderCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Toaster, toast } from "sonner";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  contactName: z.string().min(1, "Contact name is required"),
  schoolName: z.string().min(1, "School name is required"),
  email: z.string().min(1, "Email address is required").email(),
});

function IncursionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactName: "",
      schoolName: "",
      email: "",
    },
  });

  const [loading, setLoading] = useState(false);

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);

    setLoading(true);

    setTimeout(() => {
      form.reset();
      setLoading(false);

      toast.success(
        <div className="flex gap-4">
          <CircleCheckBig className="mt-1 h-4 w-4" />
          <div>
            <p className="font-semibold">Enquiry recieved!</p>
            <p>You should have an email with a copy of your submission.</p>
            <p>
              We typically response to 90% of enquiries within 2 business days.
            </p>
          </div>
        </div>,
        {
          duration: 15_000,
        },
      );
    }, 200);
  }

  return (
    <Form {...form}>
      <Toaster richColors closeButton />
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your name *</FormLabel>
              <FormControl>
                <Input
                  className="rounded-full border-violet-500 focus-visible:outline-violet-700"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="schoolName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name of school *</FormLabel>
              <FormControl>
                <Input
                  className="rounded-full border-violet-500 focus-visible:outline-violet-700"
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
                  className="rounded-full border-violet-500 focus-visible:outline-violet-700"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          className="bg-[#B34495] focus-visible:outline-purple-500"
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
