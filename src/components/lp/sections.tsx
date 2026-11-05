import { useId, useState, type ComponentProps, type ReactNode } from "react";
import { Container, cx } from "./primitives";

function PlusIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      role="img"
      className={cx("inline-block", className)}
      {...props}
    >
      <path d="M6.5 0.5V12.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12.5049 6.49512L0.504883 6.49512"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinusIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      width={13}
      height={1}
      viewBox="0 0 13 1"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      role="img"
      className={cx("inline-block", className)}
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12.505.5h-12"
      />
    </svg>
  );
}

export function Faq({
  question,
  answer,
  className,
  ...props
}: Omit<ComponentProps<"div">, "children"> & {
  question: ReactNode;
  answer: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className={className} {...props}>
      {/*
        Mirrors Radix Collapsible, whose closed answer stays in the DOM, empty and
        `hidden`. Under Tailwind v3 `flex` outranks `[hidden]`, so it still adds 8px
        under each question. The site's v4 preflight makes `[hidden]` !important, so
        the closed answer here leaves the attribute off to keep that spacing.
      */}
      <div data-state={open ? "open" : "closed"}>
        <button
          type="button"
          id={`${id}-question`}
          aria-controls={`${id}-answer`}
          aria-expanded={open}
          data-state={open ? "open" : "closed"}
          onClick={() => setOpen(!open)}
          className="flex w-full items-start justify-between gap-6 py-4 text-left text-base leading-7 text-neutral-900"
        >
          {question}
          {open ? (
            <MinusIcon className="mt-2 flex-shrink-0" />
          ) : (
            <PlusIcon className="mt-2 flex-shrink-0" />
          )}
        </button>
        <div
          id={`${id}-answer`}
          data-state={open ? "open" : "closed"}
          aria-hidden={!open}
          className="-mt-2 flex flex-col gap-2 pr-12 pb-4 text-sm leading-7 text-neutral-600"
        >
          {open && answer}
        </div>
      </div>
    </div>
  );
}

export function FaqSection({
  headline,
  subheadline,
  className,
  children,
  ...props
}: Omit<ComponentProps<"section">, "children"> & {
  headline: ReactNode;
  subheadline?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={cx("py-16 sm:py-24", className)} {...props}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 lg:max-w-5xl lg:px-10">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            {headline}
          </h2>
          {subheadline && (
            <p className="text-lg text-neutral-600">{subheadline}</p>
          )}
        </div>
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {children}
        </div>
      </div>
    </section>
  );
}

function CheckmarkIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 13 13"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      role="img"
      className={cx("inline-block", className)}
      {...props}
    >
      <path
        d="M1.5 6.5L5.5 11.5L11.5 1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PricingSection({
  headline,
  subheadline,
  price,
  cents,
  period,
  features,
  cta,
  footer,
  className,
  ...props
}: Omit<ComponentProps<"section">, "children"> & {
  headline: ReactNode;
  subheadline: ReactNode;
  price: ReactNode;
  cents?: ReactNode;
  period?: ReactNode;
  features: ReactNode[];
  cta: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className={cx("py-16 sm:py-24", className)} {...props}>
      <Container>
        <div className="grid grid-cols-1 gap-2 rounded-2xl bg-neutral-100 p-2 lg:grid-cols-2">
          <div className="flex flex-col items-start justify-between gap-10 p-8 sm:p-10">
            <div className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                {headline}
              </h2>
              <p className="text-base text-neutral-600">{subheadline}</p>
            </div>
            <div className="flex flex-col gap-4">
              {cta}
              {footer}
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 sm:p-10">
            <div className="flex items-start">
              <span className="text-xl font-semibold text-neutral-500 mt-3 mr-0.5">
                $
              </span>
              <span className="text-6xl sm:text-7xl font-medium tracking-tight text-neutral-900">
                {price}
              </span>
              {cents && (
                <span className="text-2xl font-medium text-neutral-900 mt-2">
                  {cents}
                </span>
              )}
              {period && (
                <div className="ml-3 mt-3">
                  <span className="text-base text-neutral-500">{period}</span>
                </div>
              )}
            </div>
            <ul className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-1">
              {features.map((feature, index) => (
                <li key={index} className="flex gap-3 text-sm leading-5">
                  <CheckmarkIcon className="w-3.5 h-3.5 shrink-0 stroke-neutral-400 mt-0.5" />
                  <p className="text-neutral-600">{feature}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Testimonial({
  quote,
  image,
  name,
  title,
  date,
  className,
  ...props
}: Omit<ComponentProps<"figure">, "children" | "title"> & {
  quote: ReactNode;
  image: string;
  name: ReactNode;
  title: ReactNode;
  date?: ReactNode;
}) {
  return (
    <figure
      className={cx(
        "flex flex-col justify-between gap-6 rounded-md bg-neutral-100 p-6 text-sm leading-6 text-neutral-950",
        className,
      )}
      {...props}
    >
      <blockquote>
        <p>
          <span className="select-none">“</span>
          {quote}
          <span className="select-none">”</span>
        </p>
      </blockquote>
      <figcaption className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 overflow-hidden rounded-full outline -outline-offset-1 outline-black/5">
          <img
            src={image}
            alt={typeof name === "string" ? name : ""}
            width={48}
            height={48}
            className="size-full object-cover"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold">{name}</p>
            {date && <p className="text-neutral-400 text-xs">{date}</p>}
          </div>
          <p className="text-neutral-600">{title}</p>
        </div>
      </figcaption>
    </figure>
  );
}

export function TestimonialsSection({
  headline,
  subheadline,
  children,
  className,
  ...props
}: ComponentProps<"section"> & {
  headline?: ReactNode;
  subheadline?: ReactNode;
}) {
  return (
    <section className={cx("py-16 sm:py-24", className)} {...props}>
      <Container>
        {(headline || subheadline) && (
          <div className="mb-12 max-w-2xl">
            {headline && (
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                {headline}
              </h2>
            )}
            {subheadline && (
              <p className="mt-4 text-base text-neutral-600">{subheadline}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {children}
        </div>
      </Container>
    </section>
  );
}

export function AppsSection({
  id,
  headline,
  description,
  apps,
}: {
  id?: string;
  headline: ReactNode;
  description: ReactNode;
  apps: { name: string; icon: string }[];
}) {
  return (
    <section id={id} className="py-16 sm:py-24">
      <Container>
        <div className="rounded-2xl bg-neutral-100 p-8 sm:p-12 lg:p-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
                {headline}
              </h2>
              <p className="mt-4 text-base text-neutral-600">{description}</p>
            </div>
            <div className="grid grid-cols-5 gap-4 sm:gap-5">
              {apps.map((app) => (
                <div
                  key={app.name}
                  className="aspect-square relative"
                  title={app.name}
                >
                  <img
                    src={app.icon}
                    alt={app.name}
                    className="object-contain"
                    style={{
                      position: "absolute",
                      height: "100%",
                      width: "100%",
                      inset: 0,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
