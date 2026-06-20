export const TOUR_COMPLETED_KEY = "wagner_admin_tour_completed_v1";

export function waitForElement(
  selector: string,
  timeout = 6000
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    window.setTimeout(() => {
      observer.disconnect();
      if (document.querySelector(selector)) {
        resolve();
      } else {
        reject(new Error(`Tour target not found: ${selector}`));
      }
    }, timeout);
  });
}

export function tourNavId(href: string) {
  const segment = href.split("/").filter(Boolean).pop() ?? "home";
  return `nav-${segment}`;
}
