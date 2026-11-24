export function MenuButton(props: React.ComponentProps<"button">) {
  return (
    <button type="button" {...props} className="group relative grid size-10 place-items-center rounded-full">
      <span className="relative block h-3 w-6">
        <span className="absolute inset-x-0 top-0 h-[1.5px] bg-current transition-transform duration-500 ease-[var(--ease-house)] group-data-[state=open]:translate-y-[5px] group-data-[state=open]:rotate-45" />
        <span className="absolute inset-x-0 bottom-0 h-[1.5px] origin-right bg-current transition-[translate,rotate,scale] duration-500 ease-[var(--ease-house)] group-data-[state=open]:-translate-y-[5px] group-data-[state=open]:-rotate-45 [@media(hover:hover)]:group-data-[state=closed]:group-hover:scale-x-[0.55]" />
      </span>
    </button>
  );
}
