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
import { Toaster, toast } from "sonner";

import { Button } from "../ui/button";
import { ImageUploader } from "../image-uploader";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { UploadButton } from "@/utils/uploadthing";
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
    .enum([
      "cheltenham-manager",
      "balwyn-facilitator",
      "cheltenahm-facilitator",
      "essendon-facilitator",
      "malvern-facilitator",
      "other",
    ])
    .optional()
    .refine((it) => !!it, {
      message: "Please select which role you are applying for",
    }),
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

  const [files, setFiles] = useState<{ name: string; url: string }[]>([]);
  const [uploadError, setUploadError] = useState({
    isError: false,
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (files.length === 0) {
      setUploadError({
        isError: true,
        message: "Please upload your resume / CV",
      });
    }
    form.handleSubmit(onSubmit)(e);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (files.length === 0) {
      return;
    }

    form.reset({
      role: undefined,
      wwcc: undefined,
      driversLicense: undefined,
    });
    console.log(values);
    console.log(files);

    setLoading(true);

    // todo - after submitting, set files to empty array

    setTimeout(() => {
      setLoading(false);

      toast.success(
        "Application recieved! You should have an email with a copy of your submission. We will be in touch soon!",
        {
          duration: 15_000,
        },
      );
    }, 200);
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
                  <SelectItem value="cheltenham-manager">
                    Cheltenham Studio Manager
                  </SelectItem>
                  <SelectItem value="balwyn-facilitator">
                    Balwyn Studio Party Facilitator
                  </SelectItem>
                  <SelectItem value="essendon-facilitator">
                    Essendon Studio Party Facilitator
                  </SelectItem>
                  <SelectItem value="malvern-facilitator">
                    Malvern Studio Party Facilitator
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
            className="ut-button:bg-[#9044E2] mt-2 items-start"
            endpoint="resumeUploader"
            onClientUploadComplete={(res) => {
              // Do something with the response
              setUploadError({ isError: false, message: "" });
              setFiles(res.map((it) => ({ name: it.name, url: it.url })));
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
          {files && (
            <ul className="list-disc pl-4">
              {files.map((file) => (
                <li>{file.name}</li>
              ))}
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
