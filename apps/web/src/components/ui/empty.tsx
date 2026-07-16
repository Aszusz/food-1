import type * as React from "react";
import { cn } from "@/lib/utils";

function Empty({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="empty"
      className={cn(
        "flex min-h-24 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export { Empty };
