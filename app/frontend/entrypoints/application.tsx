import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "~/App";
import { createQueryClient } from "~/queries";

// Make Vite process the images that server-rendered pages reference with vite_image_tag.
import.meta.glob("~/images/*");

const container = document.getElementById("root");
if (!container) throw new Error("#root not found: this entrypoint must run on the SPA shell page");

createRoot(container).render(
  <StrictMode>
    <QueryClientProvider client={createQueryClient()}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
