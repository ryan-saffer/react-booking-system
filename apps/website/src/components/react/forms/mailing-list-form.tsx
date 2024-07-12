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
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email address is required").email(),
});

function IncursionForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
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
              We typically respond to 90% of enquiries within 2 business days.
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="m-auto flex w-full max-w-3xl flex-col justify-center gap-8 sm:flex-row">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-white">Your name *</FormLabel>
                <FormControl>
                  <Input className="rounded-xl border-violet-500" {...field} />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-white">Your email *</FormLabel>
                <FormControl>
                  <Input className="rounded-xl border-violet-500" {...field} />
                </FormControl>
                <FormMessage className="text-red-300" />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-center">
          <Button
            className="!mt-8 w-80 rounded-full bg-[#4FE16D] text-xl font-extralight text-black hover:bg-[#379d5c]"
            type="submit"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              "Join Mailing List"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default IncursionForm;
