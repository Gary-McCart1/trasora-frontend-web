export {};

type GtagCommand = "config" | "event" | "js" | "set";

type GtagEventParams = {
  [key: string]: string | number | boolean | undefined;
};

type GtagFunction = (
  command: GtagCommand,
  targetIdOrDate: string | Date,
  params?: GtagEventParams
) => void;

declare global {
  interface Window {
    gtag: GtagFunction;
  }
}