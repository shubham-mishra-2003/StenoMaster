import * as React from "react";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined
  );

  React.useEffect(() => {
    const checkIsMobile = () => {
      const userAgent =
        navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileDevice =
        /android|iphone|ipad|ipod|windows phone|blackberry|iemobile|opera mini/i.test(
          userAgent
        );
      setIsMobile(isMobileDevice);
    };

    checkIsMobile();
  }, []);

  return !!isMobile;
}
