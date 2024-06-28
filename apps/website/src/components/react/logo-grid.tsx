import { useEffect, useState } from "react";

import type { CustomImage } from "@/types/types";

function LogoGrid({ logos }: { logos: CustomImage[] }) {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1024);
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  console.log({ isMobile });

  return (
    <div className="relative mt-8 grid grid-cols-3 lg:grid-cols-5">
      {logos.map((logo, idx) => {
        const showLeftBorder = isMobile ? idx % 3 !== 0 : idx % 5 !== 0;
        const showBottomBorder = isMobile ? idx < 12 : idx < 10;

        return (
          <div
            key={idx}
            className="relative flex h-48 items-center justify-center"
          >
            <img
              src={logo.image.src}
              alt={logo.alt}
              className="max-h-36 max-w-24 object-contain sm:max-w-40"
            />
            {showLeftBorder && (
              <div className="absolute left-0 h-4/5 w-[1px] bg-black" />
            )}
            {showBottomBorder && (
              <div className="absolute bottom-0 h-[1px] w-4/5 bg-black" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default LogoGrid;
