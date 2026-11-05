// Shared building blocks for the landing page. Class names here are Tailwind v3
// utilities resolved by `src/styles/landing.css`; this folder is excluded from
// the site's Tailwind v4 scan (see `@source not` in `app.css`).
import { clsx } from "clsx";
import type { ComponentProps, ReactNode } from "react";

export const cx = clsx;

export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx(
        "mx-auto w-full max-w-2xl px-6 md:max-w-3xl lg:max-w-6xl lg:px-10",
        className,
      )}
      {...props}
    />
  );
}

const buttonSizes = { md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
const buttonVariants = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-800",
  secondary:
    "bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-50",
  soft: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
  plain: "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100",
};

export function Button({
  size = "md",
  variant = "primary",
  className,
  ...props
}: ComponentProps<"a"> & {
  size?: keyof typeof buttonSizes;
  variant?: keyof typeof buttonVariants;
}) {
  return (
    <a
      className={cx(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium transition-colors",
        buttonSizes[size],
        buttonVariants[variant],
        className,
      )}
      {...props}
    />
  );
}

function ArrowNarrowRightIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      width={13}
      height={7}
      viewBox="0 0 13 7"
      fill="none"
      strokeWidth={1}
      role="img"
      className={cx("inline-block", className)}
      {...props}
    >
      <path
        d="M12.5049 3.49512L0.504883 3.49512"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 6.5L12.5 3.5L9.5 0.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FooterCategory({
  title,
  children,
  ...props
}: ComponentProps<"div"> & { title: ReactNode }) {
  return (
    <div {...props}>
      <h3>{title}</h3>
      <ul role="list" className="mt-2 flex flex-col gap-2">
        {children}
      </ul>
    </div>
  );
}

export function FooterLink({ href, className, ...props }: ComponentProps<"a">) {
  return (
    <li className={cx("text-neutral-400", className)}>
      <a href={href} {...props} />
    </li>
  );
}

export function SocialLink({
  href,
  name,
  className,
  children,
  ...props
}: ComponentProps<"a"> & { name: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={name}
      className={cx("text-white [&>svg]:w-6 [&>svg]:h-6", className)}
      {...props}
    >
      {children}
    </a>
  );
}

/** The footer call to action: a headline and a link laid out like an email field. */
export function FollowLink({
  headline,
  subheadline,
  href,
  label,
  className,
}: {
  headline: ReactNode;
  subheadline: ReactNode;
  href: string;
  label: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("flex max-w-sm flex-col gap-2", className)}>
      <p>{headline}</p>
      <div className="flex flex-col gap-4 text-neutral-400">{subheadline}</div>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="follow-row flex items-center border-b border-white/20 py-2"
      >
        <span className="flex-1 text-white">{label}</span>
        <span className="relative inline-flex size-7 items-center justify-center rounded-full hover:bg-white/10">
          <ArrowNarrowRightIcon />
        </span>
      </a>
    </div>
  );
}

export function Footer({
  cta,
  links,
  fineprint,
  socialLinks,
  className,
  ...props
}: Omit<ComponentProps<"footer">, "children"> & {
  cta: ReactNode;
  links: ReactNode;
  fineprint: ReactNode;
  socialLinks?: ReactNode;
}) {
  return (
    <footer className={cx("pt-16", className)} {...props}>
      <div className="bg-neutral-900 py-16 text-white">
        <Container className="flex flex-col gap-16">
          <div className="grid grid-cols-1 gap-x-6 gap-y-16 text-sm leading-7 lg:grid-cols-2">
            {cta}
            <nav className="grid grid-cols-2 gap-6 sm:grid-cols-4">{links}</nav>
          </div>
          <div className="flex items-center justify-between gap-10 text-sm leading-7">
            <div className="text-neutral-500">{fineprint}</div>
            {socialLinks && (
              <div className="flex items-center gap-4 sm:gap-10">
                {socialLinks}
              </div>
            )}
          </div>
        </Container>
      </div>
    </footer>
  );
}
