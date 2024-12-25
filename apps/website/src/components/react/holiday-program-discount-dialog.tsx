import { Dialog, DialogContent, DialogTitle } from "@/react-ui/dialog";
import { useEffect, useState } from "react";

import { DateTime } from "luxon";
import { DialogDescription } from "@radix-ui/react-dialog";
import type { GetImageResult } from "astro";
import HolidayProgramDiscountDialogForm from "./forms/holiday-program-discount-dialog-form";
import { VisuallyHidden } from "@/react-ui/visually-hidden";

export type DiscountCode = { code: string; expiryDate: string };

const STORAGE_KEY = "holiday-program-dialog-cooldown-expires-at";

export function HolidayProgramDiscountDialog({
  promotionalImage,
  frame,
}: {
  promotionalImage: {
    img: GetImageResult;
    alt: string;
  };
  frame: { img: GetImageResult };
}) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<DiscountCode | null>(null);

  useEffect(() => {
    const expiryTime = parseInt(localStorage.getItem(STORAGE_KEY) || "-1");

    const timeout = setTimeout(() => {
      if (expiryTime === -1 || Date.now() > expiryTime) {
        // dialog never seen before, or the cooldown has expired
        setOpen(true);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  function closeDialog(expiry: "short" | "long" = "short") {
    // if getting a discount code, don't show again for 6 months, otherwise show in 3 days.
    const MS_IN_3_DAYS = 60 * 60 * 24 * 3 * 1000;
    const MS_IN_180_DAYS = 60 * 60 * 24 * 180 * 1000;
    const expiryTime =
      expiry === "short"
        ? Date.now() + MS_IN_3_DAYS
        : Date.now() + MS_IN_180_DAYS;
    localStorage.setItem(STORAGE_KEY, expiryTime.toString());
    setOpen(false);
  }

  function handleOnSuccess(data: DiscountCode) {
    setResult(data);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (result) {
          closeDialog("long");
        } else {
          closeDialog("short");
        }
      }}
    >
      <VisuallyHidden>
        <DialogTitle>Holiday Program Offer</DialogTitle>
      </VisuallyHidden>
      <DialogContent className="max-w-lg p-1 lg:w-full lg:max-w-7xl">
        <div className="flex flex-col lg:flex-row">
          <img
            className="hidden aspect-square h-full w-full object-cover lg:block lg:max-h-full lg:w-1/2"
            src={promotionalImage.img.src}
            alt={promotionalImage.alt}
          />
          <div className="relative h-full min-h-[500px] w-full bg-[#6AC2E6] lg:max-h-full lg:w-1/2">
            <div className="absolute inset-0 z-0">
              <img
                className="h-full w-full object-cover p-2"
                src={frame.img.src}
                alt="frame"
              />
            </div>
            <div className="relative z-10 mx-2 flex h-full flex-col items-center justify-center gap-1">
              {result === null ? (
                <>
                  <p className="text-center font-lilita text-3xl lg:text-4xl">
                    Hey friend
                  </p>
                  <p className="text-center font-lilita text-3xl lg:text-4xl">
                    Would you like
                  </p>
                  <p className="text-center font-lilita text-5xl lg:text-6xl">
                    10% off
                  </p>
                  <p className="text-center font-lilita text-3xl lg:text-4xl">
                    our January
                    <br />
                    Holiday Programs?
                  </p>
                  <HolidayProgramDiscountDialogForm
                    onSuccess={handleOnSuccess}
                  />
                </>
              ) : (
                <>
                  <p className="text-center font-lilita text-3xl lg:text-4xl">
                    Done! Your discount code is
                  </p>
                  <p className="mt-4 text-center font-lilita text-5xl text-white lg:text-7xl">
                    {result.code}
                  </p>
                  <p className="mt-4 text-center font-lilita text-3xl lg:text-4xl">
                    This code will expire on
                  </p>
                  <p className="mt-4 text-center font-lilita text-3xl text-white lg:text-5xl">
                    {DateTime.fromISO(result.expiryDate).toLocaleString(
                      DateTime.DATE_MED,
                    )}
                  </p>
                  <p className="mt-4 text-center font-lilita text-3xl lg:text-4xl">
                    Be sure to save it
                    <br />
                    and use it soon!
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <VisuallyHidden>
          <DialogDescription>Holiday Program Offer</DialogDescription>
        </VisuallyHidden>
      </DialogContent>
    </Dialog>
  );
}
