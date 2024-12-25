import "@/styles/sonner.css";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/react-ui/form";

import { Button } from "@/react-ui/button";
import { Checkbox } from "@/react-ui/checkbox";
import type { DiscountCode } from "../holiday-program-discount-dialog";
import { FORM_WEBHOOK } from "@/utils/constants";
import { Input } from "@/react-ui/input";
import { LoaderCircle } from "lucide-react";
import { Toaster } from "@/react-ui/sonner";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().min(1, "Email address is required").email(),
  joinMailingList: z.boolean().default(true),
});

function HolidayProgramDiscountDialogForm({
  onSuccess,
}: {
  onSuccess: (data: DiscountCode) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      joinMailingList: true,
    },
  });

  const [loading, setLoading] = useState(false);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    try {
      const response = await fetch(
        `${FORM_WEBHOOK}?formId=holidayProgramDiscount`,
        {
          body: JSON.stringify(values),
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        onSuccess(data);
      } else {
        toast.error("There was an error getting your discount code.");
        return;
      }
    } catch (err) {
      console.error(err);
      toast.error("There was an error getting your discount code.");
      return;
    } finally {
      setLoading(false);
    }

    form.reset();
  }

  return (
    <Form {...form}>
      <Toaster richColors closeButton />
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="m-auto mt-4 flex w-full min-w-[290px] max-w-3xl flex-col justify-center gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Name" {...field} />
                </FormControl>
                <FormMessage className="font-extrabold text-pink-600" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage className="font-extrabold text-pink-600" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="joinMailingList"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center space-x-3 space-y-0 rounded-md">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-thin">
                    Keep me posted with Fizz Kidz news and promotions.
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <Button
            className="bg-[#9044E2] p-6 font-lilita text-lg hover:bg-[#F6BA33] sm:text-2xl"
            type="submit"
            disabled={!form.watch("joinMailingList")}
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              "Yeah! Send me a discount code!"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default HolidayProgramDiscountDialogForm;
