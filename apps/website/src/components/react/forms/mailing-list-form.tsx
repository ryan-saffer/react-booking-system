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
import { FORM_WEBHOOK } from "@/utils/constants";
import { Input } from "../ui/input";
import { LoaderCircle } from "lucide-react";
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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      await fetch(`${FORM_WEBHOOK}?formId=mailingList`, {
        body: JSON.stringify(values),
        method: "POST",
        mode: "no-cors",
      });
    } catch (err) {
      console.error(err);
      toast.error("There was an error joining the mailing list.");
      return;
    } finally {
      setLoading(false);
    }

    form.reset();
    toast.success(
      "Done! Keep an eye out for the latest Fizz Kidz news and offers.",
      {
        duration: 15_000,
      },
    );
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
