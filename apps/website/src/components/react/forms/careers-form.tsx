import "@/styles/sonner.css";

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
import { Label } from "../ui/label";
import { LoaderCircle } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Toaster } from "../ui/sonner";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  name: z.string().min(1, "Contact name is required"),
  email: z.string().min(1, "Email address is required").email(),
  contactNumber: z
    .string()
    .min(10, "Contact number must be at least 10 digits long"),
  role: z
    .enum(["manager", "supervisor", "facilitator", "other"])
    .optional()
    .refine((it) => !!it, {
      message: "Please select which role you are applying for",
    }),
  location: z.enum([
    "balwyn",
    "cheltenham",
    "essendon",
    "kingsville",
    "malvern",
  ]),
  wwcc: z.enum(["yes", "no"]),
  driversLicense: z.enum(["yes", "no"]),
  application: z.string().min(1, "Please answer"),
  reference: z.string().min(1, "Please answer"),
});

function CareersForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      role: undefined,
      wwcc: undefined,
      driversLicense: undefined,
      application: "",
      reference: "",
    },
  });

  const [file, setFile] = useState<{ name: string; url: string } | null>(null);
  const [uploadError, setUploadError] = useState({
    isError: false,
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setUploadError({
        isError: true,
        message: "Please upload your resume / CV",
      });
    }
    form.handleSubmit(onSubmit)(e);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!file) {
      return;
    }

    setLoading(true);

    try {
      await fetch(`${FORM_WEBHOOK}?formId=careers`, {
        body: JSON.stringify({ resume: file, ...values }),
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

    form.reset({
      role: undefined,
      wwcc: undefined,
      driversLicense: undefined,
    });
    setFile(null);
    toast.success(
      "Application recieved! You should have an email with a copy of your submission. We will be in touch soon!",
      {
        duration: 15_000,
      },
    );
  }

  return (
    <Form {...form}>
      <Toaster richColors closeButton />
      <form onSubmit={handleCustomSubmit} className="space-y-4">
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
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Which role are you applying for? *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                    aria-label="select role"
                  >
                    {field.value ? <SelectValue /> : "Select role"}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="manager">Studio Manager</SelectItem>
                  <SelectItem value="supervisor">Studio Supervisor</SelectItem>
                  <SelectItem value="facilitator">
                    Studio Facilitator
                  </SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Which location do you want to work at? *</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                    aria-label="select location"
                  >
                    {field.value ? <SelectValue /> : "Select location"}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="balwyn">Balwyn</SelectItem>
                  <SelectItem value="cheltenham">Cheltenham</SelectItem>
                  <SelectItem value="essendon">Essendon</SelectItem>
                  <SelectItem value="kingsville">Kingsville</SelectItem>
                  <SelectItem value="malvern">Malvern</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="wwcc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Do you have, or are willing to obtain, a Working With Children's
                Check? *
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                    aria-label="select wwcc status"
                  >
                    {field.value ? <SelectValue /> : "Please answer"}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="driversLicense"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Do you have a drivers license? (Having one is not required!) *
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger
                    className="rounded-xl border-violet-500 focus-visible:outline-purple-700"
                    aria-label="select drivers license status"
                  >
                    {field.value ? <SelectValue /> : "Please answer"}
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="application"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Let us know why you would like to work at Fizz Kidz *
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
        <div>
          <Label className="font-semibold">
            Please upload your Resume / CV *
          </Label>
          <UploadButton
            className="mt-2 items-start ut-button:bg-[#9044E2]"
            endpoint="resumeUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              setUploadError({ isError: false, message: "" });
              setFile({ name: res[0].name, url: res[0].url });
            }}
            onUploadError={(error: Error) => {
              // Do something with the error.
              setUploadError({ isError: true, message: error.message });
            }}
          />
          {uploadError.isError && (
            <p className="text-sm font-medium text-destructive">
              {uploadError.message}
            </p>
          )}
          {file && (
            <ul className="list-disc pl-4">
              <li>{file.name}</li>
            </ul>
          )}
        </div>
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How did you hear about us? *</FormLabel>
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
            "Submit"
          )}
        </Button>
      </form>
    </Form>
  );
}

export default CareersForm;
