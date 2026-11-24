import { Toaster as Sonner } from "sonner";

// One toaster for the whole site. Cards come from notify() in lib/toast.tsx.
// Mobile: right inset clears the floating buttons (Fabs) in the bottom-right corner.
export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      visibleToasts={3}
      gap={10}
      offset={24}
      mobileOffset={{ bottom: 16, left: 16, right: 72 }}
      containerAriaLabel="Notifications"
      toastOptions={{ unstyled: true, className: "w-full" }}
    />
  );
}
