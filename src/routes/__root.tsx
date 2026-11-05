import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import * as React from "react";
import appCss from "@/styles/app.css?url";
import { RootProvider } from "fumadocs-ui/provider/tanstack";
import { appName } from "@/lib/shared";
import { NavigationProgress } from "@/components/navigation-progress";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: `${appName} — Multi-letter shortcuts for macOS`,
      },
      {
        name: "description",
        content:
          "Make your Mac speak your language. Learn Chord: memorable key sequences, app-specific actions, and scriptable workflows for macOS.",
      },
      { name: "theme-color", content: "#f8f7f4" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="flex flex-col min-h-screen">
        <RootProvider theme={{ defaultTheme: "light" }}>
          <NavigationProgress />
          <Outlet />
        </RootProvider>
        <Scripts />
      </body>
    </html>
  );
}
