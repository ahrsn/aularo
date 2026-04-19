"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { Wordmark } from "@/components/ui/wordmark";

type PrintPairSheetProps = {
  displayName: string;
  shortCode: string;
  pairUrl: string;
  workspaceLabel?: string;
};

export function PrintPairSheet({
  displayName,
  shortCode,
  pairUrl,
  workspaceLabel,
}: PrintPairSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [qrSvg, setQrSvg] = useState<string>("");
  const [today, setToday] = useState<string>("");

  // Print sheets are for real venues — always show the canonical production
  // host, regardless of where the modal was opened (localhost, preview, prod).
  const printableUrl = pairUrl.replace(
    /^https?:\/\/[^/]+/,
    "https://clarra.show",
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    QRCode.toString(printableUrl, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: "#0e1410", light: "#ffffff00" },
    })
      .then((svg) => {
        if (!cancelled) setQrSvg(svg);
      })
      .catch(() => {
        if (!cancelled) setQrSvg("");
      });
    return () => {
      cancelled = true;
    };
  }, [printableUrl]);

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  if (!mounted) return null;

  const urlForDisplay = printableUrl.replace(/^https?:\/\//, "");
  const footerLabel = workspaceLabel || "Clarra";

  return createPortal(
    <div className="print-portal">
      <div className="print-pair-sheet">
        <div className="pps-page">
          <header className="pps-header">
            <Wordmark size={26} />
            <div className="pps-header-right">
              <div className="pps-eyebrow">Display pairing sheet</div>
              <div className="pps-display-name">{displayName}</div>
            </div>
          </header>

          <section className="pps-hero">
            <div className="pps-eyebrow pps-hero-label">Short code</div>
            <div className="pps-code">{shortCode}</div>
          </section>

          <section className="pps-url-row">
            <div
              className="pps-qr"
              aria-hidden
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <div className="pps-url-col">
              <div className="pps-eyebrow">
                Type this into the TV&rsquo;s browser
              </div>
              <div className="pps-url">{urlForDisplay}</div>
              <div className="pps-url-hint">
                Or scan the code with your phone to copy and share it.
              </div>
            </div>
          </section>

          <section className="pps-steps-section">
            <div className="pps-eyebrow">How to set it up</div>
            <ol className="pps-steps">
              <li>
                <span className="pps-step-num">1</span>
                <span>Open any browser on the TV.</span>
              </li>
              <li>
                <span className="pps-step-num">2</span>
                <span>
                  Type the URL above into the address bar (or scan the QR code
                  with a phone to copy it).
                </span>
              </li>
              <li>
                <span className="pps-step-num">3</span>
                <span>
                  The TV pairs to <em>{displayName}</em> in seconds and starts
                  playing automatically.
                </span>
              </li>
              <li>
                <span className="pps-step-num">4</span>
                <span>
                  Leave the browser open and full-screen. The screen
                  re-pairs on its own if it ever reloads.
                </span>
              </li>
            </ol>
          </section>

          <footer className="pps-footer">
            <span>{footerLabel}</span>
            <span className="pps-footer-dot">·</span>
            <span>{today}</span>
            <span className="pps-footer-dot">·</span>
            <span>clarra.show</span>
          </footer>
        </div>
      </div>
    </div>,
    document.body,
  );
}
